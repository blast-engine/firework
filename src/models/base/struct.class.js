import { createMixableClass } from '@blast-engine/mixable'
import { Model } from './model.class'

export const Struct = createMixableClass({
  name: 'Struct',
  inherits: [ Model ],
  body: class {

    isLoaded() {
      this._abstract('isLoaded')
    }

    /**
     * @throws
     */
    _ensureLoaded() {
      this._ensure(`data is loaded`, () => this.isLoaded())
    }
  
  }
})