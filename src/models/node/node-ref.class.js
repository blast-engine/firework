import * as u from '@blast-engine/utils'
import { createMixableClass } from '@blast-engine/mixable'
import { FullNodeQuery } from '../../queries'
import { Model } from '../base'

export const NodeRef = createMixableClass({
  name: 'NodeRef',
  inherits: [ Model ],
  body: class {

    _constructor({ path, state } = {}) {
      this._ensure('NodeRef is given `path` in constructor', () => !!path)
      this._path = this.pathToArray(path)
      this._state = state || {}
    }

    update(updateMap) {
      return { [this.strPath()]: updateMap }
    }

    set(data) {
      return { [this.strPath()]: data }
    }

    delete() {
      return this.set(null)
    }

    pathToArray(path) {
      if (!path) return []
      if (u.isArray(path)) return path
      else if (u.isString(path)) return path.split('/')
      throw new Error(`${path} is neither a string nor an array`)
    }
   
    pathToString(path) {
      if (!path) return ''
      if (u.isArray(path)) return path.join('/')
      else if (u.isString(path)) return path 
      throw new Error(`${unknown} is neither a string nor an array`)
    }
    
    strPath(subPath) {
      return this.pathToString(this.path(subPath))
    }

    path(subPath) {
      return this._path.concat(this.pathToArray(subPath))
    }

    transaction(deriveUpdate) {
      const instantiateFull = data =>
        this.spinoff(this.class().full(), {
          path: this._path,
          state: this._state,
          data
        })
      
      return {
        path: this.strPath(),
        run: data => { 
          const relativeUpdate = deriveUpdate(instantiateFull(data))
          if (!relativeUpdate) return relativeUpdate
          return u.merge(data, relativeUpdate)
        },
        instantiateResult: data => {
          return instantiateFull(data)
        }
      }
    }

    /**
     * @override
     */
    query() {
      const query = new FullNodeQuery({
        path: this.strPath(),
        instantiate: (data) => this.spinoff(this.class().full(), { 
          path: this._path, 
          data,
          query
        })
      })
      return query
    }

  }
})