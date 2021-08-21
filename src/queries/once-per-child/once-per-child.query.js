import { createMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { Query } from '../query.class'

export const FullNodeStreamQuery = createMixableClass({
  name: 'FullNodeStreamQuery',
  type: 'stream',
  inherits: [ Query ],
  body: class {
    
    _constructor(args = {}) {
      ensure('OncePerChildQuery is given a string path', () => typeof args.path === 'string')
      this._type = 'stream'
      this._path = args.path
    }

    equals(query) {
      return (
        this.typeEquals(query)
        && this.path() === query.path()
      )
    }

    path(){
      return this._path
    }

  }
})