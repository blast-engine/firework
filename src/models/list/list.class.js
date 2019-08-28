import { createMixableClass } from '@blast-engine/mixable'
import { kv, k, m } from '@blast-engine/utils'
import { Full } from '../base'
import { ListRef } from './list-ref.class'
import { ListStruct } from './list-struct.class'

export const List = createMixableClass({
  name: 'List',
  inherits: [ ListStruct, ListRef ],
  body: class {

    _constructor(args = {}) {
      this._onModelConstructed(() => {
        this.itemsKV = kv(args.data)
          .map(({ k, v }) => ({
            k,
            v: this._spinoff(this._class().item(), { 
              data: v,
              path: args.path.concat([ k ])
            })
          }))

        this.items = this.itemsKV
          .reduce((items, { k, v:item }) => m(items, { [k]: item }), {})
      })
    }

    item(key) {
      return this.items[key]
    }

    childItemsByKey(key){
      return this.itemsKV.reduce((acc, item) => {
        if ( item.v && item.v._data(key) && acc.indexOf(item.v._data(key)) === -1 ) acc.push(item.v._data(key))
        return acc
      }, [])
    }

    asArray({ numItems = Infinity, startIndex = 0 } = {}){
      const requestedEnd = numItems + startIndex
      const endPoint = (requestedEnd > this.itemsKV.length) 
        ? this.itemsKV.length 
        : requestedEnd
      return this.itemsKV
        .slice(startIndex, endPoint)
        .map(({ k, v }) => v)
    }

    asArrayOfKVPairs() {
      return this.itemsKV
    }

  }
})