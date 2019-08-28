import { createMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { Query } from '../query.class'

export const FullNodeQuery = createMixableClass({
  name: 'FullNodeQuery',
  inherits: [ Query ],
  body: class {
    
    _constructor(args = {}) {
      ensure('FullNodeQuery is given a string path', () => typeof args.path === 'string')
      this._path = args.path
      this._type = 'full-node'
    }

    equals(query) {
      return (
        this._typeEquals(query)
        && this.path() === query.path()
      )
    }

    path(){
      return this._path
    }

  }
})