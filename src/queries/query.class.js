import { createMixableClass } from '@blast-engine/mixable'
import { ensure } from '../ensure.function'

export const Query = createMixableClass({
  name: 'Query',
  body: class {

    isFireworkQuery() { return true }

    _constructor(args = {}) {
      ensure('child sets this.type', () => !!this._type)
      ensure('query is given an instantiate function', () => !!args.instantiate)
      this._args = args
      this._shouldEmitNext = args.shouldEmitNext
      this._instantiate = args.instantiate
      this.isQuery = true
    }

    _ensure(rule, pass) {
      ensure(rule, pass, this.constructor.className())
    }

    _abstract(methodName) {
      this._ensure(
        'abstract methods cannot be called directly.'
          + (methodName ? ` method: ${methodName}` : ''), 
        () => false
      )
    }

    _typeEquals(query) {
      return (
        query
        && typeof query === 'object'
        && this.type() === query.type()
      )
    }

    type(){
      return this._type
    }

    shouldEmitNext(prev, next) {
      if (!this._shouldEmitNext) return true
      return this._shouldEmitNext(prev, next)
    }

    instantiate(data, context){
      return this._instantiate(data, context)
    }

    equals(query) {
      this._abstract()
    }
  }
})