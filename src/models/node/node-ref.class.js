import * as u from '@blast-engine/utils'
// import { FullNodeQuery } from '../../queries'

export const createNodeClass = provisions => 
  provisions.createMixableClass({
    name: 'NodeRef',
    inherits: [ provisions.models.Model ],
    provisions,
    body: class {
  
      _constructor({ path } = {}) {
        this._provisions.ensure({
          check: () => !!path,
          failMsg: 'NodeRef is not given `path` in constructor', 
        })
        this._path = u.pathToArray(path)
      }

      path(subPath) {
        return this._path.concat(u.pathToArray(subPath))
      }

      strPath(subPath) {
        return u.pathToString(this.path(subPath))
      }

      set(data) {
        return { [this.strPath()]: data }
      }

      delete() {
        return this.set(null)
      }
  
      update(updateMap) {
        return { [this.strPath()]: updateMap }
      }

      // transaction(deriveUpdate) {
      //   const instantiateFull = data =>
      //     this.spinoff(this.class().full(), {
      //       path: this._path,
      //       data
      //     })
        
      //   return {
      //     path: this.strPath(),
      //     run: data => { 
      //       const relativeUpdate = deriveUpdate(instantiateFull(data))
      //       if (!relativeUpdate) return relativeUpdate
      //       return u.merge(data, relativeUpdate)
      //     },
      //     instantiateResult: data => {
      //       return instantiateFull(data)
      //     }
      //   }
      // }
  
      /**
       * @override
       */
      query() {
        // const query = new FullNodeQuery({
        //   path: this.strPath(),
        //   instantiate: (data) => this.spinoff(this.class().full(), { 
        //     path: this._path, 
        //     data,
        //     query
        //   })
        // })
        // return query
      }
  
    }
  })