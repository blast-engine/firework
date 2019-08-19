import { createMixableClass } from '@smackchat/mixable'
import { Model } from './model.class'

export const Ref = createMixableClass({
  name: 'Ref',
  inherits: [ Model ],
  body: class {

    initialize(){
      this._abstract('initialize')
    }

    query() {
      this._abstract('query')
    }
  
  }
})