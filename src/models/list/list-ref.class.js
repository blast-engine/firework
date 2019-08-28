import { createMixableClass, isMixableClass, isMixableInstance } from '@blast-engine/mixable'
import { keys } from '@blast-engine/utils'
import { Ref } from '../base'
import { FullNodeQuery } from '../../queries'

export const ListRef = createMixableClass({
  name: `list_ref`,
  inherits: [ Ref ],
  body: class {

    _constructor(args = {}) {
      this._ensure('ListRef has Ref class prop',  () => 'itemRef' in this._class())
      this._ensure('path is provided in args', () => 'path' in args)
      
      this.path = args.path
    }

    query() {
      // @todo: use "once per child" query
      return new FullNodeQuery({
        path: this._strPath(),
        instantiate: (data) => this._spinoff(this._class().full(), { 
          path: this._path(), 
          data 
        })
      })
    }

    newKey() {
      return this._fb.newKey(this._strPath())
    }

    getItemRefByKey( key /* string */ ) {
      return this.itemRef(key)
    }

    itemRef(key) {
      return this._spinoff(this._class().itemRef(), {
        path: this._path(key)
      })
    }

    /**
     * @returns Update
     */
    add({ initArgs, newItemId }) {
      if (!newItemId) newItemId = this.newKey()

      const newItemRef = this._spinoff(this._class().itemRef(), {
        path: this._path([ newItemId ]),
      })
    
      return newItemRef.initialize({ id: newItemId, ...initArgs })
    }

    _strPath(subPath /* undefined | string (shallow path) | Array<string> */ ) {
      return this._pathToString(this._path(subPath))
    }

    _path(subPath /* undefined | string (shallow path) | Array<string> (path array)*/ ) {
      return this._pathToArray(this.path).concat(this._pathToArray(subPath))
    }

  }
})