import access from 'safe-access'

import { createMixableClass, isMixableInstance } from '@smackchat/mixable'
import { keys, kv, values } from '@smackchat/utils'
import { Struct } from '../base'
import { flagSymbol } from '../flag-symbol.function'

export const ListStruct = createMixableClass({
  name: 'ListStruct',
  inherits: [ Struct ],
  body: class {

    _constructor(args = {}) {
      this._ensure('ListStruct is given `data` in constructor', () => 'data' in args)

      this.data = args.data
      this.itemStructs = kv(this.data)
        .reduce((itemStructs, { k:name, v:itemData }) => {
          itemStructs[name] = this._spinoff(this._class().itemStruct(), { 
            data: itemData
          })
          return itemStructs
        }, {})
    }

    /**
     * @returns boolean
     */
    isLoaded() {
      return values(this.itemStructs).every(s => s.isLoaded())
    }

    /**
     * @returns boolean
     */
    isEmpty() {
      this._ensureLoaded()
      return this.data === null
    }

    itemStructByKey( key /* string */){
      this._ensure('we have item', () => !!this.itemStructs[key])
      return this.itemStructs[key]
    }

    keys(){
      this._ensureLoaded()
      return keys(this.data)
    }
  }
})