import { kv, keys, doAsync, values } from '@blast-engine/utils'
import { AuthStruct } from '../models'
import { isReady } from '../is-ready.function'

export const SPECIAL_DEPENDENCIES = {
  AUTH: 'auth'
}

export class Kernel {

  /**
   * args: { 
   *  createWatcher (function) 
   *  rootRef (Ref)
   *  onAuthStateChanged (function)
   *  backendActions ({ [name]: function })
   *  manualFlush (boolean) [optional] // for testing
   *  didFlush (function) [optional] // for testing
   * }
   */
  constructor(args = {}) {

    args.didFlush = args.didFlush || (() => undefined)
    this.args = args

    // backwards compat (use Root)
    this.root = this.args.rootRef
    if (this.args.Root) {
      this.root = new this.args.Root({
        fbService: {
          newKey: this.args.fbService.newKey,
          timestamp: this.args.fbService.timestamp
        }
      })
    }

    this.state = {
      nextRequestId: 0,
      requests: {},
      flushRequested: false,
      requestsAwaitingFlush: [],
      auth: undefined,
      nextAuthHandlerId: 0,
      externalAuthHandlers: {},
      timeDelta: undefined, // @todo: FIXX!X!
      now: undefined // @todo: FIXX!X!
    }

    // put fbservice stuff in kernel api
    Object.assign(this, this.args.fbService)

    this.args.onAuthStateChanged(authState => this._handleAuthChange(authState))
    this.args.fbService.shouldRefreshAuth.subscribe(authState => this._handleAuthChange(authState))
  
    // @todo: FIX THIS RACE CONDITION
    // @todo: this should be a kernel provision like 'auth'
    this.args.fbService.fetchTimeDelta()
      .then(timeDelta => {
        this.state.timeDelta = timeDelta
        this.state.now = () => Date.now() + timeDelta
      })
  }

  timeDelta() {
    return this.state.timeDelta
  }

  auth() {
    return this.state.auth
  }

  fbService() {
    return this.args.fbService
  }

  subscribeToAuth(handler) {
    const handlerId = `handler_${this.state.nextRequestId++}`
    this.state.externalAuthHandlers[handlerId] = handler
    return handlerId
  }

  unsubscribeToAuth(handlerId) {
    delete this.state.externalAuthHandlers[handlerId]
  }

  destroyRequest(reqId) {
    const request = this.state.requests[reqId]

    values(request.watchers)
      .forEach(watcher => watcher.kill())

    request.dead = true

    delete this.state.requests[reqId]
  }

  async doAction(action, args = {}) {
    return action({
      snap: instructions => this.snap(instructions),
      performUpdates: u => this.fbService().performUpdates(u),
      performTransaction: t => this.fbService().performTransaction(t),
      doAction: (...args) => this.doAction(...args),
      auth: this.state.auth,
      ...args
    })
  }

  flush() {

    this.state.currentlyFlushing = this.state.requestsAwaitingFlush
    this.state.requestsAwaitingFlush = []
    this.state.flushRequested = false

    this.state.currentlyFlushing
      .forEach(reqId => this._flushRequest(this.state.requests[reqId]))

    this.state.currentlyFlushing = undefined
    this.args.didFlush()
  }

  async snap(instructions) {

    // check we need/have auth
    const needsAuth = instructions.steps.some(step => (step.requires || []).includes('auth'))
    if (needsAuth && !this.state.auth) throw new Error('auth not ready')

    // do each step in sequence
    const data = { 
      auth: this.state.auth, 
      rootRef: this.root, // deprecated
      root: this.root 
    }

    for(let i = 0; i < instructions.steps.length; i++) {
      let step = instructions.steps[i]
      let query = step.query(data)
      if (query === null) data[step.name] = null
      else data[step.name] = await this.args.snapQuery({ 
        query, 
        getFbRef: this.args.fbService.getRef 
      })
    }

    return instructions.final.instantiate({ 
      ...data,
      rootRef: this.root, // deprecated
      root: this.root,
      auth: this.state.auth
    })
  }

  createRequest(instructions) {
    const reqId = `request_${this.state.nextRequestId++}`

    // debug
    if (instructions.debug.kernel)
      console.log('creating request ' + instructions.name)
 
    const request = {
      id: reqId,
      debug: instructions.debug,
      watchers: {},
      result: undefined,
      instructions,
      dead: false,
      kill: () => this.destroyRequest(reqId),
      getStepWatcher(stepName) {
        const watcher = this.watchers[stepName]
        if (!watcher) return {}
        else return watcher
      },
      getStepResult(stepName) {
        return this.getStepWatcher(stepName).result
      },
      getStepResults(stepNames){
        return stepNames.reduce(
          (bothForms, name) => { 
            const r = this.getStepResult(name)
            bothForms.map[name] = r
            bothForms.arr.push(r)
            return bothForms
          }, 
          { arr: [], map: {} }
        )
      }
    }

    const emitter = {
      request,
      handlers: [],
      current() {
        return this.request.result
      },
      subscribe(handler) {
        this.handlers.push(handler)
      },
      emit() {
        this.handlers.forEach(handler => handler(this.current()))
      }
    }

    request.emitter = emitter
    
    this.state.requests[reqId] = request
    this._requestFlush(reqId, 'not-being-used')

    return request
  }

  _flushRequest(request) {

    if (!request) return

    request.instructions.steps.forEach(step => {
      
      // defaults
      step.requires = step.requires || []

      // check auth
      const requiresAuth = step.requires.includes(SPECIAL_DEPENDENCIES.AUTH)
      if (requiresAuth && !this.state.auth) {
        this._clearWatcher(request, step.name)
        return
      }
  
      // get step dependencies
      const stepDeps = step.requires
        .filter(d => !values(SPECIAL_DEPENDENCIES).includes(d))
      const stepDepResults = request.getStepResults(stepDeps)
  
      // check step dependencies
      if (!stepDepResults.arr.every(r => isReady(r))) {
        this._clearWatcher(request, step.name)
        return 
      }
    
      // compute query
      const query = step.query({
        ...stepDepResults.map,
        rootRef: this.root, // deprecated
        root: this.root,
        auth: this.state.auth,
        timeDelta: this.state.timeDelta,
        now: this.state.now
      })
 
      // handle null query
      if (query === null) {
        this._clearWatcher(request, step.name)
        this._setNullWatcher(request, step.name)
        return
      }
      
      // check query is different
      if (query.equals(request.getStepWatcher(step.name).query)) return

      this._resetWatcher(request, step.name, query)
  
    })

    const final = request.instructions.final

    const applyFinalResult = nextResult => {
      if (request.result !== nextResult) {
        if (!nextResult && request.instructions.keepOldResultUntilNew) {
          return
        }

        // debug
        if (request.instructions.debug.kernel)
          console.log(
            'new result for request: ' 
              + request.instructions.name,
            nextResult
          )

        request.result = nextResult
        request.emitter.emit()
      }
    }

    // check auth
    const requiresAuth = final.take.includes(SPECIAL_DEPENDENCIES.AUTH)
    if (requiresAuth && !this.state.auth) {
      applyFinalResult(undefined)
      return
    }

    // get step dependencies
    const stepDeps = final.take
      .filter(d => !values(SPECIAL_DEPENDENCIES).includes(d))
    const stepDepResults = request.getStepResults(stepDeps)

    // check step dependencies
    if (!stepDepResults.arr.every(r => isReady(r))) {
      applyFinalResult(undefined)
      return
    }

    // instantiate result
    applyFinalResult(final.instantiate({
      ...stepDepResults.map,
      rootRef: this.root, // deprecated
      root: this.root,
      auth: this.state.auth,
      timeDelta: this.state.timeDelta,
      now: this.state.now
    }))
  }

  _requestFlush(reqId) {
    let promise = Promise.resolve()
    if(!this.state.requestsAwaitingFlush.includes(reqId))
      this.state.requestsAwaitingFlush.push(reqId)

    if (!this.state.flushRequested && !this.args.manualFlush)
      promise = doAsync(() => this.flush())
  
    this.state.flushRequested = true
    return promise
  }

  _resetWatcher(request, stepName, query) {

    if (request.watchers[stepName])
      request.watchers[stepName].kill()

    const watcher = this.args.createWatcher({ 
      query, 
      getFbRef: this._getFbRef, 
      onResultUpdated: () => {
        
        // debug
        if (request.instructions.debug.kernel)
          console.log(
            'watcher fired for ' + request.instructions.name, 
            'step ' + stepName,
            watcher.result
          )

        this._requestFlush(request.id, stepName)
      }
    })

    // @todo: kind of a hack?
    watcher.query = query
  
    request.watchers[stepName] = watcher
  }

  _clearWatcher(request, stepName) {
    if (!request.watchers[stepName]) return
    request.watchers[stepName].kill()
    delete request.watchers[stepName]
  }

  // @todo: hacky
  _setNullWatcher(request, stepName) {
    request.watchers[stepName] = { 
      result: null,
      kill(){}
    }
  }

  async _handleAuthChange(auth) {

    if (auth) {
      this.state.auth = this.root._spinoff(AuthStruct, {
        data: {
          userId: auth.uid,
          email: auth.email,
          emailVerified: auth.emailVerified,
          isAnonymous: auth.isAnonymous
        }
      })
    } else {
      if (auth === null) 
        this.fbService().loginAnon()
      
      this.state.auth = undefined
    }

    // flush all requests
    await Promise.all(
      values(this.state.requests)
        .map(request => this._requestFlush(request.id))
    )

    values(this.state.externalAuthHandlers)
      .forEach(h => h(this.state.auth))

  }

}