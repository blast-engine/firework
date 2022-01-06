export const provisionFullNodeQueryModel = provisions => 
  provisions.createMixableClass({
    name: 'FullNodeQuery',
    inherits: [ provisions.queries.Query ],
    provisions,
    body: class {
      
      _constructor({ path } = {}) {
        this._provisions.ensure({
          check: () => typeof path === 'string',
          failMsg: 'FullNodeQuery needs a string path'
        })

        this._path = path
      }

      type() { return 'full-node' }
      path() { return this._path }

      equals(query) {
        return (
          this.typeEquals(query)
          && this.path() === query.path()
        )
      }

    }
  })