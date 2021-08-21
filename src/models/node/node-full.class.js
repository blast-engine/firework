import * as u from '@blast-engine/utils'
import { createMixableClass } from '@blast-engine/mixable'
import { LoadableModel } from '../base'
import { NodeRef } from './node-ref.class'

export const Node = createMixableClass({
  name: 'Node_full',
  inherits: [ LoadableModel, NodeRef ],
  body: class {

    _constructor({ data, query } = {}){
      this._ensure(
        'NodeStruct is given `data` in constructor', 
        () => data !== undefined
      )
      this._data = data
      this._query = query
    }

    isLoaded() { return this._data !== undefined }

    isEmpty() {
      this._ensureLoaded()
      return this._data === null
    }

    get(path) { return this.data(path) }

    data(path) {
      if (!path) return this._data

      const val = u.get(
        this._data || {},
        this.pathToString(path)
      )

      if (val === undefined) {
        if (this.isLoaded()) return null
        else return undefined
      } else return val
    }
    
  }
})