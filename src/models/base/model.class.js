import { createMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'

export const Model = createMixableClass({
  name: 'Model',
  body: class {

    _constructor({ fb, cache } = {}) {
      this._fb = fb
      this.cache = cache || {}
      ;(this.onConstructCallbacks || []).forEach(c => c())
    }

    _onModelConstructed(callback) {
      if (!this.onConstructCallbacks)
        this.onConstructCallbacks = []
      this.onConstructCallbacks.push(callback)
    }

    spinoff(Model, args) {
      return new Model({
        ...args,
        fb: this._fb
      })
    }

    clone(provisions = {}) {
      return this.spinoff(this.class(), provisions)
    }

    _ensure(rule, pass) {
      ensure(
        rule, 
        pass,
        this.class().className()
      )
    }

    _abstract(methodName) {
      this._ensure(
        'abstract methods cannot be called directly.'
          + (methodName ? ` method: ${methodName}` : ''), 
        () => false
      )
    }

  }
})