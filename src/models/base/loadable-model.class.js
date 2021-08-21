import { createMixableClass } from '@blast-engine/mixable'
import { Model } from './model.class'

export const LoadableModel = createMixableClass({
  name: 'LoadableModel',
  inherits: [ Model ],
  body: class {

    /**
     * @abstract
     */
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