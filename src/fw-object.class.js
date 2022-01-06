export const createModelClass = provisions => 
  provisions.createMixableClass({
    name: 'Model',
    provisions,
    body: class {

      abstract() {
        this._provisions.ensure({ 
          check: () => false,
          failMsg: 'abstract methods cannot be called directly.'
        })
      }

    }
  })