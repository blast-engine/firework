const u = require('@blast-engine/utils')

export class MockFirebaseClient {

  constructor({ state } = {}) {
    if (state) this.state = state
    else this.state = {
      data: {},
      meta: {},
      subscriptions: {},
      nextSubscriptionId: 0
    }
  }


  update = async (updateOrUpdates) => {
    const updates = Array.isArray(updateOrUpdates) 
      ? updateOrUpdates : [ updateOrUpdates ]
    const delta = updatesToDelta(updates)
    this.state.data = u.set(this.state.data, delta)
    await u.timeout(this.updateSubscriptions)
  } 

  getValueAndMetaForPathArr = path => {
    const pathArr = this.pathAs('arr', path)
    const value = u.get(this.state.data, pathArr.join('.')) || null
    const meta = u.get(this.state.meta, pathArr.join('.')) || null
    return { value, meta }
  }

  snap = async query => {
    u.timeout(1)
    const { value } = this.getValueAndMetaForPathArr(query.path)
    const fbSnapshot = createFBSnapshot({ value })
    return fbSnapshot
  }

  updateSubscriptions = () => {
    Object.values(this.state.subscriptions).forEach(subsForPath => {
      subsForPath.forEach((sub, handler) => {
        if (sub.dead) return subsForPath.delete(handler)
        const dataNode = this.getValueAndMetaForPathArr(sub.query.path)
        sub.last = dataNode.value
        if (sub.lastEmitted !== sub.last) {
          sub.lastEmitted = sub.last
          const fbSnapshot = createFBSnapshot({ value: sub.lastEmitted })
          sub.onNext(fbSnapshot)
        }
      })
    })
  }

  killSubsription = query => {
    const strPath = this.pathAs('str', query.path)
    const allSubs = this.state.subscriptions
    const subsForPath = allSubs[strPath]
    if (!subsForPath) return
    const sub = subsForPath.get(query.handler)
    sub.kill()
    subsForPath.delete(query.handler)
  }

  createSubscription = query => {
    const subscription = { 
      id: `subscription_${this.state.nextSubscriptionId++}`, 
      lastValue: undefined,
      query,
      onNext: value => query.handler(value),
      dead: false,
      kill: () => subscription.dead = true
    }

    const path = query.path
    const strPath = this.pathAs('str', path)
    const allSubs = this.state.subscriptions
    if (!allSubs[strPath]) allSubs[strPath] = new Map()
    const subsForPath = allSubs[strPath]
    subsForPath.set(subscription.query.handler, subscription)
    u.timeout(this.updateSubscriptions)
    return subscription
  }

  pathAs = (requestedType, path, delimiter = '/') => {
    if (u.isStr(path)) {
      if (requestedType === 'str') return path
      else return path.split(/\.|\//)
    }

    if (!u.isArr(path)) throw new Error('invalid path')
    if (requestedType === 'str') return path.join(delimiter)
    else return path
  }

  getFbRef = (path) => {
    const ensureEventIsSuported = event => {
      if (event !== 'value') 
        throw new Error('only support value event rn :3')
    }
    return {
      on: (event, handler) => {
        ensureEventIsSuported(event)
        const query = { path, handler }
        this.createSubscription(query)
      },
      once: async (event) => {
        ensureEventIsSuported(event)
        const query = { path }
        return this.snap(query)
      },
      off: (event, handler) => {
        ensureEventIsSuported(event)
        const query = { path, handler }
        this.killSubsription(query)
      }
    }
  }

  // ---- auth stuff

  anonAuthRegistry = {}
  authRegistry = {}
  authHandler = () => null
  onAuthStateChanged = handler => {
    this.authHandler = handler
    this.authHandler(this.auth)
  }
  emitUpdatedAuth = auth => this.authHandler(auth)
  auth = null

  loginAnon = async () => {
    await u.timeout(1)
    const auth = { uid: '' + Date.now(), isAnonymous: true }
    this.anonAuthRegistry[auth.uid] = auth
    this.auth = auth
    this.emitUpdatedAuth(this.auth)
  }

  signup = async ({ anonId, email, password }) => {
    await u.timeout(1)
    const anonAuth = this.anonAuthRegistry[anonId]
    if (!anonAuth) throw new Error('no anon user in registry to sign up')
    const auth = { 
      ...anonAuth,
      email, 
      password,
      isAnonymous: false
    }
    delete this.anonAuthRegistry[anonId]
    this.authRegistry[email] = auth
    this.auth = auth
    this.emitUpdatedAuth(this.auth)
  }

  login = async ({ email, password }) => {
    await u.timeout(1)
    const auth = this.authRegistry[email]
    if (!auth) throw new Error('email not registered')
    if (password !== auth.password) throw new Error('password incorrect')
    this.auth = auth
    this.emitUpdatedAuth(this.auth)
  }
  
}

// ---- helpers

const createFBSnapshot = ({ value }) => {
  return { val: () => value }
}

const updatesToDelta = arrayOfUpdates /* Array<Update> */ => {

  function nestedObjectToArrayOfIndividualUpdates(nestedObject) {
    return u.keys(nestedObject)
      .reduce((arrayOfIndividualUpdates, key) => {
        if ( typeof nestedObject[key] !== 'object'
          || nestedObject[key] === null
          || nestedObject[key]['.sv'] !== undefined ) // this is a firebase ServerValue special flag. should remain as object
          return [{ path: key, val: nestedObject[key] }]
            .concat(arrayOfIndividualUpdates)
        else
          return nestedObjectToArrayOfIndividualUpdates(nestedObject[key])
            .map(fbUpdate => ({ path: `${key}/${fbUpdate.path}`, val: fbUpdate.val }))
            .concat(arrayOfIndividualUpdates)

      }, [])
  }

  var arrayOfArraysOfIndividualUpdates = arrayOfUpdates
    .map(nestedObject => nestedObjectToArrayOfIndividualUpdates(nestedObject))

  const arrayOfFbUpdateGroups = arrayOfArraysOfIndividualUpdates
    .map(fbUpdates => fbUpdates.reduce((fbUpdatesGroup, fbUpdate) => {
      return Object.assign({},
        fbUpdatesGroup,
        { [fbUpdate.path]: fbUpdate.val } )
    }, []))

  const delta = arrayOfFbUpdateGroups
    .reduce((delta, fbUpdatesGroup) => {
      return Object.assign({},
        delta,
        fbUpdatesGroup )
    }, {})

  return delta

}
