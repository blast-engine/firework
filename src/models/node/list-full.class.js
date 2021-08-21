import { createMixableClass } from '@blast-engine/mixable'
import { kv, k, m } from '@blast-engine/utils'
import { Node } from '../node'
import { ListRef } from './list-ref.class'

export const List = createMixableClass({
  name: 'List_full',
  inherits: [ Node, ListRef ],
  body: class {

    _constructor(args = {}) {
      this._data = args.data
      this._query = args.query

      this._items = u.kv(this._data).reduce((items, { k, v:data }) => {
        const item = this.spinoff(this.class().item(), { path: this.path(k), data })
        return { ...items, [k]: item }
      }, items) 
    }

    isLoaded() {
      if (typeof this._data === undefined) return false
      else return true
    }
    
    items() {
      this._ensureLoaded()
      return u.v(this._items)
    }

    item(key) {
      this._ensureLoaded()
      if (this._query.includes(key)) return undefined
      return this._items[key]
    }

    count() {
      this._ensureLoaded()
      return this.items().length
    }

    filter(select) {
      return this.items().filter(select)
    }

  }
})