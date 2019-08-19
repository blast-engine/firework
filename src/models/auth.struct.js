import { createMixableClass } from '@smackchat/mixable'
import { Struct } from './base'

export const AuthStruct = createMixableClass({
  name: 'AuthStruct',
  inherits: [ Struct ],
  
  body: class {

    _constructor(args = {}) {
      this._ensure('auth data is never empty', () => args.data !== null)
      this.data = args.data
    }

    isLoaded() {
      return this.data !== undefined
    }

    userId() {
      return this.data.userId
    }

    id() {
      return this.userId()
    }

    uid() {
      return this.userId()
    }

    isAnonymous() {
      return this.data.isAnonymous
    }

    isAnon() {
      return this.isAnonymous()
    }

    email() {
      return this.data.email
    }

    emailIsVerified() {
      return this.data.emailVerified
    }

  }

})