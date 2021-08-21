import { createMixableClass, isMixableClass, isMixableInstance } from '@blast-engine/mixable'
import { keys } from '@blast-engine/utils'
import { NodeRef } from '../node'
import { FullNodeQuery, FullNodeStreamQuery, SelectionByKeysQuery } from '../../queries'
import { Selection  } from './selection-full.class'

export const ListRef = createMixableClass({
  name: `List_ref`,
  inherits: [ NodeRef ],
  body: class {

    _constructor(args = {}) {
      this._ensure('ListRef has Ref class prop',  () => 'itemRef' in this.class())
      this._ensure('path is provided in args', () => 'path' in args)
      this._path = args.path
    }

    add({ id, args }) {
      if (!id) id = this.newKey()
      const newItemRef = this.spinoff(this.class().itemRef(), { path: this.path(id) })
      return newItemRef.initialize({ id, ...args })
    }

    remove(id) {
      this._update({ [id]: null })
    }

    itemRef(key) {
      return this.spinoff(this.class().itemRef(), {
        path: this.path(key)
      })
    }

    fullNodeQuery() {
      const query = new FullNodeQuery({
        path: this.strPath(),
        instantiate: data => this.spinoff(this.class().full(), { 
          path: this.path(), 
          data,
          query
        })
      })
      return query
    }

    fullNodeStreamQuery() {
      const query = new FullNodeStreamQuery({
        path: this.strPath(),
        instantiate: data => this.spinoff(this.class().full(), { 
          path: this.path(), 
          data,
          query
        })
      })
      return query
    }

    selectionByKeysQuery(keys = []) {
      const query = new SelectionByKeysQuery({
        path: this.strPath(),
        childKeys: keys,
        instantiate: (data) => this.spinoff(Selection.full(), {
          path: this.path(),
          keys,
          data,
          query
        })
      })
      return query
    } 

  }
})