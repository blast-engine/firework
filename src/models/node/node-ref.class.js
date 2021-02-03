import { createMixableClass } from '@blast-engine/mixable'
import { Ref } from '../base'
import { merge } from '@blast-engine/utils'
import { flagSymbol } from '../flag-symbol.function'
import { FullNodeQuery } from '../../queries'

export const NodeRef = createMixableClass({
  name: 'NodeRef',
  inherits: [ Ref ],
  body: class {

    _constructor(params = {}) {
      this._ensure('NodeRef is given `path` in constructor', () => !!params.path)
      this.path = params.path
    }


    // @deprecated
    fill(data) {
      const FullModel = this._class().full()
      return this._spinoff(FullModel, { path: this._path(), data })
    }

    // NEW
    set(path, value) { return this._update({ [path]: value }) }
    initialize(initData) { return this._update(initData) }
    
    /**
     * @override
     */
    initialize() {
      return this._update({ [flagSymbol()]: true })
    }

    /**
     * @override
     * @returns Query
     */
    query() {
      return this._spinoff(FullNodeQuery, {
        path: this._strPath(),
        instantiate: (data) => this._spinoff(this._class().full(), { 
          path: this._path(), 
          data 
        })
      })
    }
    
    _strPath(subPath /* undefined | string (shallow path) | Array<string> */ ) {
      return this._pathToString(this._path(subPath))
    }

    _path(subPath /* undefined | string (shallow path) | Array<string> (path array)*/ ) {
      return this._pathToArray(this.path).concat(this._pathToArray(subPath))
    }

    /**
     * @return Update
     */
    _update(updateData /* serializable obj without arrays or undefined */) {
      return { [this._strPath()]: this._prepareUpdateData(updateData) }
    }

    /**
     * @return Transaction
     */
    _transaction(deriveUpdate /* data => null | undefined | serializable object with no arrays or undefined */) {
      const cloneWithData = data => 
        this._spinoff(this._class(), merge(this, { data }))
      return {
        path: this._strPath(),
        run: data => { 
          const update = deriveUpdate(cloneWithData(data))
          if (!update) return update
          return this._prepareUpdateData(merge(data, update))
        },
        instantiateResult: data => {
          return cloneWithData(data)
        }
      }
    }

    /**
     * @return Update
     */
    delete() {
      return this._delete()
    }

    _delete() {
      return { [this._strPath()]: null }
    }

    /**
     * @return Obj (prepared update data)
     * @overridable
     *    if you override this one, you should also override WithData._waitingForParts()
     */
    _prepareUpdateData(updateData /* serializable obj */ ) {
      return updateData 
      // return merge(updateData, { [flagSymbol()]: true }) // @DEPRECATED
    }

  }
})