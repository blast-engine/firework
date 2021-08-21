import { createMixableClass } from '@blast-engine/mixable'
import { NodeRef } from '../node'
import { SelectionByKeysQuery } from '@/queries'

export const SelectionRef = createMixableClass({
  name: `Selection_ref`,
  inherits: [ NodeRef ],
  body: class {

    _constructor({ path, keys } = {}) {
      this._path = path
      this._keys = keys
    }

    query() {
      const query = new SelectionByKeysQuery({
        path: this.strPath(),
        childKeys: this._keys,
        instantiate: (data) => this.spinoff(this.class().full(), {
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