import { createMixableClass } from '@blast-engine/mixable'
import * as u from '@blast-engine/utils'
import { Node } from '../node'
import { SelectionRef } from './selection-ref.class'

export const Selection = createMixableClass({
  name: `Selection_full`,
  inherits: [ Node, SelectionRef ],
  body: class {

    _constructor({ data, query } = {}) {
      this._data = data
      this._query = query

      this._items = u.kv(this._data)
        .filter(({ k }) => this._query.includesKey(k))
        .reduce((items, { k, v:data }) => {
          const item = this.spinoff(this.class().item(), { path: this.path(k), data })
          return { ...items, [k]: item }
        }, items) 
    }
    
    isLoaded() {
      if (typeof this._data === undefined) return false
      return this._query.keys().every(k => {
        const item = this._items[k]
        return item && this.items[k].isLoaded()
      })
    } 

    items() {
      this._ensureLoaded()
      return this._query.keys().map(k => this._items[k])
    }

    item(key) {
      this._ensureLoaded()
      if (!this._query.includes(key)) return undefined
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