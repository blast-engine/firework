import { createMixableClass } from '@blast-engine/mixable'
import { LoadableModel } from './base'

export const AuthStruct = createMixableClass({
  name: 'Auth_struct',
  inherits: [ LoadableModel ],
  
  body: class {

    _constructor({ data } = {}) {
      this._ensure('auth data is never empty', () => data !== null)
      this._data = data
    }

    isLoaded() {
      return this._data !== undefined
    }

    userId() {
      return this._data.userId
    }

    id() {
      return this.userId()
    }

    uid() {
      return this.userId()
    }

    isAnonymous() {
      return this._data.isAnonymous
    }

    isAnon() {
      return this.isAnonymous()
    }

    email() {
      return this._data.email
    }

    emailIsVerified() {
      return this._data.emailVerified
    }

  }

})