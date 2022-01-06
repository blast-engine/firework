export const provisionQueryModel = provisions => 
  provisions.createMixableClass({
    name: 'Query',
    inherits: [ provisions.models.Model ],
    provisions,
    body: class {

      _constructor({ shouldEmitNext, instantiate } = {}) {
        this._provisions.ensure({
          check: () => !!instantiate,
          failMsg: 'query is not given instantiate function'
        })

        this._shouldEmitNext = shouldEmitNext || (() => true)
        this._instantiate = instantiate

        this._postConstructCallbacks.push(() => {
          this._provisions.ensure({
            check: () => !!this._type,
            failMsg: 'query type not set'
          })
        })
      }

      isQuery() { return true }
      
      type(){ return this.abstract() }
      equals(query) { this.abstract() }

      typeEquals(query) {
        return (
          query
          && typeof query === 'object'
          && query.isQuery()
          && this.type() === query.type()
        )
      }

      shouldEmitNext(prev, next) {
        return this._shouldEmitNext(prev, next)
      }

      instantiate(data, context){
        return this._instantiate(data, context)
      }

    }
  })