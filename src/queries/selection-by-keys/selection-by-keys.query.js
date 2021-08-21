import { createMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { Query } from '../query.class'
import { isArray } from '@blast-engine/utils'

export const SelectionByKeysQuery = createMixableClass({
  name: 'SelectionByKeysQuery',
  inherits: [ Query ],
  body: class {
    
    _constructor(args = {}) {
      ensure('SelectionByKeysQuery is given a string path', () => typeof args.path === 'string')
      ensure('SelectionByKeysQuery is given child keys',() => !!args.keys)
      ensure('keys are an array in SelectionByKeysQuery', () => isArray(args.keys))
      
      this._type = 'child-selection-by-keys'
      this._path = args.path
      this._keys = args.keys
    }

    equals(query) {
      return (
        this.typeEquals(query)
        && this.path() === query.path()
        && this.keysAreSame(query.keys())
      )
    }

    keysAreSame(otherKeys) {
      if (this.keys().length !== otherKeys.length) return false
      this.keys().every(k => otherKeys.includes(k))
    }

    includes(key) {
      this.keys().includes(key)
    }

    type() {
      return this._type
    }

    path(){
      return this._path
    }

    keys(){
      return this._keys
    }

  }
})