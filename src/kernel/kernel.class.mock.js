import { kv, v, keys, doAsync, values } from '@blast-engine/utils'
import { AuthStruct } from '../models'
import { SPECIAL_DEPENDENCIES } from './kernel.class'

export class MockKernel {

  m_updateAuth(auth) {
    this.state.auth = auth
      ? new AuthStruct({
          data: {
            userId: auth.uid,
            email: auth.email,
            emailVerified: auth.emailVerified,
            isAnonymous: auth.isAnonymous
          }
        })
      : undefined

    v(this.state.externalAuthHandlers)
      .forEach(h => h(this.state.auth))
  }

  m_requests() {
    return v(this.state.requests)
  }

  m_updateRequestResult(reqId, result) {
    const r = this.state.requests[reqId]
    r.result = result
    r.emitter.emit()
  }

  constructor(args = {}) {

    args.didFlush = args.didFlush || (() => undefined)
    args.fbService = {}
    this.args = args

    this.state = {
      nextRequestId: 0,
      requests: {},
      flushRequested: false,
      requestsAwaitingFlush: [],
      auth: undefined,
      nextAuthHandlerId: 0,
      externalAuthHandlers: {}
    }

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
    delete this.state.requests[reqId]
  }

  createRequest(instructions) {
    const reqId = `request_${this.state.nextRequestId++}`

    const request = {
      id: reqId,
      debug: instructions.debug,
      watchers: {},
      result: undefined,
      instructions,
      dead: false,
      kill: () => this.destroyRequest(reqId)
    }

    const emitter = {
      request,
      handlers: [],
      subscribe(handler) {
        this.handlers.push(handler)
      },
      emit() {
        this.handlers.forEach(handler => handler(request.result))
      }
    }

    request.emitter = emitter
    this.state.requests[reqId] = request
    return request
  }

}