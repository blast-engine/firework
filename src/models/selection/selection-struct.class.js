import { createMixableClass } from '@blast-engine/mixable'
import { keys, kv } from '@blast-engine/utils'
import { Struct } from '../base'

export const SelectionStruct = createMixableClass({
  name: `selection_struct`,
  inherits: [ Struct ],
  body: class {

    _constructor(args = {}) {
      this._ensure('SelectionStruct has itemStruct class prop', () => 'itemStruct' in this._class())
      this._ensure('Item keys are provided in args', () => Array.isArray(args.keys))
      this._ensure('data must be an object, where keys correspond to given keys (missing keys means still loading)', () => (
        typeof args.data === 'object' // can be null 
      ))

      this.keys = args.keys
      this.itemStructs = kv(args.data)
        .reduce((itemStructs, { k, v:data }) => {
          itemStructs[k] = this._spinoff(this._class().itemStruct(), { 
            keys: this.keys, 
            data
          })
          return itemStructs
        }, {})

      this.data = args.data
    }
    
    isLoaded() {
      if (typeof this.data === undefined) return false
      return this.keys.every(k => {
        const itemStruct = this.itemStructs[k]
        return itemStruct && this.itemStructs[k].isLoaded()
      })
    }

  }
})