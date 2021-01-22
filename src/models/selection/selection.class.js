import { createMixableClass } from '@blast-engine/mixable'
import { kv, m, kvr, k } from '@blast-engine/utils'
import { Full } from '../base'
import { SelectionRef } from './selection-ref.class'
import { SelectionStruct } from './selection-struct.class'

export const Selection = createMixableClass({
  name: `Selection`,
  inherits: [ Full, SelectionStruct, SelectionRef ],
  body: class {

    _constructor(args = {}) {
      this._onModelConstructed(() => {
        const { updatedKey, previous } = args.context || {}

        if (previous && updatedKey) {

          const updatedItem = this._spinoff(this._class().item(), { 
            path: this._pathToArray(args.path).concat([ updatedKey ]),
            data: args.data[updatedKey]
          })

          this.itemsKV = k(args.data)
            .filter(k => this.keys.includes(k))
            .map(k => {
              if (k !== updatedKey) return { k, v: previous.items[k] }
              return { k, v: updatedItem }
            })

        } else {     

          this.itemsKV = kv(args.data)
            .filter(({ k }) => this.keys.includes(k))
            .map(({ k, v:data }) => ({
              k,
              v: this._spinoff(this._class().item(), { 
                path: this._pathToArray(args.path).concat([ k ]),
                data
              })
            }))

        }

        this.items = kvr(this.itemsKV)
       
      })
    }

    asArray() {
      return this.itemsKV.map(({ v }) => v);
    }

    byKey(key) {
      return this.item(key)
    }

    item(key) {
      return this.items[key]
    }

    count() {
      return this.itemsKV.length
    }

    subselection(keys) {
      return this._spinoff(this._class(), {
        path: this.path,
        data: keys.reduce((d, key) => m(d, { [key]: this.data[key] }), {}),
        keys
      })
    }

    asKV() {
      return this.itemsKV
    }

  }
})