import { createMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { isArray, isString} from '@blast-engine/utils'

export const Model = createMixableClass({
  name: 'Model',
  body: class {

    _constructor({ fbService, config } = {}) {
      this._config = config
      this._fbService = fbService
      this._fb = fbService
      ;(this.onConstructCallbacks || []).forEach(c => c())
    }

    _onModelConstructed(callback) {
      if (!this.onConstructCallbacks)
        this.onConstructCallbacks = []
      this.onConstructCallbacks.push(callback)
    }

    _class() {
      return this.constructor
    }

    _ensure(rule, pass) {
      ensure(
        rule, 
        pass,
        this._class().className()
      )
    }

    _abstract(methodName) {
      this._ensure(
        'abstract methods cannot be called directly.'
          + (methodName ? ` method: ${methodName}` : ''), 
        () => false
      )
    }

    _spinoff(Model, args) {
      return new Model({
        ...args,
        fbService: this._fbService
      })
    }

    _pathToArray(path) {
      if (!path) return []
      if (isArray(path)) return path
      else if (isString(path)) return path.split('/')
      else throw new Error(`${path} is neither a string nor an array`)
    }
   
    _pathToString(path) {
      if (!path) return ''
      if (isArray(path)) return path.join('/')
      else if (isString(path)) return path 
      else throw new Error(`${unknown} is neither a string nor an array`)
    }

  }
})