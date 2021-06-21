import { createMixableClass } from '@blast-engine/mixable'
import { kv, m, kvr, k } from '@blast-engine/utils'
import { Full } from '../base'
import { SelectionRef } from './selection-ref.class'


export const Selection = createMixableClass({
  name: `Selection`,
  inherits: [ Full, SelectionRef ],
  body: class {

    _constructor(args = {}) {
      this.data = args.data
      this.keys = args.keys
      // const { updatedKey, previous } = args.context || {}

      // if (previous && updatedKey) {
        
      //   const updatedItem = this._spinoff(this._class().item(), { 
      //     path: this._pathToArray(args.path).concat([ updatedKey ]),
      //     data: args.data[updatedKey]
      //   })

      //   this.itemsKV = k(args.data)
      //     .filter(k => this.keys.includes(k))
      //     .map(k => {
      //       if (k !== updatedKey) return { k, v: previous.items[k] }
      //       return { k, v: updatedItem }
      //     })

        

      // } else {     

        this.items = kv(args.data)
          .filter(k => this.keys.includes(k))
          .reduce((items, { k, v:data }) => {
            items[k] = this._spinoff(this._class().item(), { 
              path: this._path(k),
              data
            })
            return items
          }, {})
      // }
     
    }
    
    isLoaded() {
      if (typeof this.data === undefined) return false
      return this.keys.every(k => {
        const item = this.items[k]
        return item && this.items[k].isLoaded()
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