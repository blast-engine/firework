import { createMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { Query } from '../query.class'
import { isArray } from '@blast-engine/utils'

export const ArrayOfChildKeysQuery = createMixableClass({
  name: 'ArrayOfChildKeysQuery',
  inherits: [ Query ],
  body: class {
    
    _constructor(args = {}) {
      ensure('ArrayOfChildKeysQuery is given a string path', () => typeof args.path === 'string')
      ensure('ArrayOfChildKeysQuery is given child keys',() => !!args.childKeys)
      ensure('childKeys are an array in ArrayOfChildKeysQuery', () => isArray(args.childKeys))
      this._path = args.path
      this._type = 'array-of-child-keys'
      this._childKeys = args.childKeys
    }

    equals(query) {
      return (
        this._typeEquals(query)
        && this.path() === query.path()
        && (
          this._childKeys.length === query._childKeys.length
          && this._childKeys.every(k => query._childKeys.includes(k))
        )
      )
    }

    path(){
      return this._path
    }

    childKeys(){
      return this._childKeys
    }

  }
})