import { createMixableClass } from '@smackchat/mixable'
import { ensure } from '../ensure.function'

export const Query = createMixableClass({
  name: 'Query',
  body: class {

    _constructor(args = {}) {
      ensure('child sets this.type', () => !!this._type)
      ensure('query is given an instantiate function', () => !!args.instantiate)
      this._args = args
      this._instantiate = args.instantiate
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

    instantiate(data){
      return this._instantiate(data)
    }

    equals(query) {
      this._abstract()
    }
  }
})