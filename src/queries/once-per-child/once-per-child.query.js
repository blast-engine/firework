import { createMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { Query } from '../query.class'

export const OncePerChildQuery = createMixableClass({
  name: 'OncePerChildQuery',
  type: 'once-per-child',
  inherits: [ Query ],
  body: class {
    
    _constructor(args = {}) {
      ensure('OncePerChildQuery is given a string path', () => typeof args.path === 'string')
      this._path = args.path
      this._type = 'once-per-child'
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