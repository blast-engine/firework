import { createMixableClass } from '@smackchat/mixable'
import { kv, m, kvr } from '@smackchat/utils'
import { Full } from '../base'
import { SelectionRef } from './selection-ref.class'
import { SelectionStruct } from './selection-struct.class'

export const Selection = createMixableClass({
  name: `Selection`,
  inherits: [ Full, SelectionStruct, SelectionRef ],
  body: class {

    _constructor(args = {}) {
      this._onModelConstructed(() => {
        this.itemsKV = kv(args.data)
          .map(({ k, v:data }) => ({
            k,
            v: this._spinoff(this._class().item(), { 
              path: this._pathToArray(args.path).concat([ k ]),
              data
            })
          }))

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