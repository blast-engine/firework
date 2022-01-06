export const createLoadableModelClass = provisions => 
  provisions.createMixableClass({
    name: 'LoadableModel',
    inherits: [ provisions.models.Model ],
    provisions,
    body: class {

      _constructor({ cache } = {}) {   
        this._cache = cache || {}
      }

      isLoaded() {
        this.abstract()
      }
  
      ensureLoaded() {
        this._provisions.ensure({
          check: () => this.isLoaded(),
          failMsg: 'data is not loaded'
        })
      }
  
    }
  })