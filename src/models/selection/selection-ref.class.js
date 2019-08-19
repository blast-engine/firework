import { createMixableClass } from '@smackchat/mixable'
import { Ref } from '../base'
import { ArrayOfChildKeysQuery } from '../../queries'

export const SelectionRef = createMixableClass({
  name: `SelectionRef`,
  inherits: [ Ref ],
  body: class {

    _constructor(args = {}) {
      this._ensure('SelectionRef has itemRef class prop',  () => 'itemRef' in this._class())
      this._ensure('path is provided in args', () => 'path' in args)
      this._ensure('item keys are provided in args', () => Array.isArray(args.keys))
      
      this.keys = args.keys
      this.path = args.path
    }

    query({
      
    } = {}) {
      return new ArrayOfChildKeysQuery({
        path: this._strPath(),
        childKeys: this.keys,
        instantiate: data => this._spinoff(this._class().full(), {
          path: this.path,
          keys: this.keys,
          data: data
        })
      })
    }    

    // @todo: these 2 methods are repeated for list/selection/node
    _strPath(subPath /* undefined | string (shallow path) | Array<string> */ ) {
      return this._pathToString(this._path(subPath))
    }

    _path(subPath /* undefined | string (shallow path) | Array<string> (path array)*/ ) {
      return this._pathToArray(this.path).concat(this._pathToArray(subPath))
    }

  }
})