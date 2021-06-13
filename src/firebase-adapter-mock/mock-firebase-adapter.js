const u = require('@blast-engine/utils')
const { MockFirebaseClient } = require('./mock-firebase-client')

export const createMockFirebaseAdapter = () => {
  const mfc = new MockFirebaseClient()
  return {
    firebase: mfc,
    login: mfc.loginAnon,
    loginAnon: mfc.loginAnon,
    signup: mfc.signup,
    getRef: mfc.getFbRef,
    update: mfc.update,
    performUpdates: mfc.update,
    onAuthStateChanged: mfc.onAuthStateChanged,
    shouldRefreshAuth: new u.Emitter(),
    timestamp: () => Date.now() + '',
    newKey: () => Date.now() + '',
  }
}

