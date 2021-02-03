import access from 'safe-access'

import { createMixableClass } from '@blast-engine/mixable'
import { shallowClone } from '@blast-engine/utils'
import { Struct } from '../base'
import { flagSymbol } from '../flag-symbol.function'

// @deprecated
export const NodeStruct = createMixableClass({
  name: 'NodeStruct',
  inherits: [ Struct ],
  body: class {

    _constructor(params = {}) {
      this._ensure('NodeStruct is given `data` in constructor', () => 'data' in params)
      this.data = params.data
      if (this.data && typeof this.data === 'object') 
        delete this.data._
    }

    place(path) {
      const FullModel = this._class().full()
      return new FullModel({ path, data: this._data() })
    }

    /**
     * @returns boolean
     */
    isLoaded() {
      if (this.data === undefined) return false // not loaded at all
      else if (this.data === null) return true // empty node
      else if (typeof this.data !== 'object') return true // this is a primitive value
      else if (this._waitingForParts && this._waitingForParts()) return false // partially loaded by someone else
      else return true // we have an fully loaded model
    }

    /**
     * @returns boolean
     */
    isEmpty() {
      this._ensureLoaded()

      return this.data === null
    }

    /**
     * @returns any
     * This is to access raw data (not models)
     *   - objects, primitives returned (not models)
     *   - can be computed (take parameters), or be a simple getter
     *   - if current model is not loaded, will return undefined
     */
    _data(path /* string | Array<string> | undefined */) {
      const data = shallowClone(this.data)
      if (data && typeof data === 'object')
        delete data[flagSymbol()]

      if (!path) return data

      const val = access(
        data || {},
        Array.isArray(path) ? path.join('.') : path )

      if (val === undefined) {
        if (this.isLoaded()) return null
        else return undefined
      } else return val
    }

    /**
     * @throws
     */
    _ensureLoaded() {
      this._ensure(`data is loaded`, () => this.isLoaded())
    }

    /**
     * @returns boolean
     * @overridable
     *    if you override this one, you should also override WithPath._prepareUpdateData()
     */
    _waitingForParts(){
      return false
      // return !this.data[flagSymbol()]
    }
  }
})