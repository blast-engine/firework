import { noop, Emitter } from '@blast-engine/utils'
import { createLogin } from './create-login.function'
import { createLoginAnon } from './create-login-anon.function'
import { createSignup } from './create-signup.function'
import { createPerformUpdates } from './create-perform-updates.function'
import { createSvTimestamp } from './create-sv-timestamp.function'
import { createGetFbRef } from './create-get-fb-ref.function'
import { createAuthEmitter } from './create-auth-emitter.function'
import { createCreateNewKey } from './create-new-key.function'
import { createLogout } from './create-logout.function'
import { changePassword } from './change-password.function'
import { changeEmail } from './change-email.function'
 

export const createFirebaseService = ({ firebase, adminMode }) => {

  // refactor signup? 
  //   signup using credential link doesnt 
  //   refresh auth state, but updates auth().currentUser

  const shouldRefreshAuth = new Emitter()

  const fbSignup = createSignup(firebase)
  const signup = (...args) => fbSignup(...args)
    .then(user => { // this should be ({ user }) if using firebase client version >7 (we use 7.9.0)
      shouldRefreshAuth.emit(user)
      return user
    })

  return {
    firebase,

    // this shouldnt be here, right? should we have this at all?
    latestTick: async () => {
      const ref = firebase.database().ref('latest-tick')
      const snapshot = await ref.once('value')
      return snapshot.val()
    },
    
    fetchTimeDelta: async () => {
      const ref = firebase.database().ref('__timestamp_for_delta__')
      const localBefore = Date.now()
      await ref.set(firebase.database.ServerValue.TIMESTAMP)
      const localAfter = Date.now()
      const snapshot = await ref.once('value')
      const svTime = snapshot.val()
      const avgLocal = Math.floor((localAfter + localBefore) / 2)
      return svTime - avgLocal
    },
    performTransaction: transaction => {
      return new Promise((resolve, reject) => {
        firebase.database()
          .ref(transaction.path)
          .transaction(transaction.run, (error, committed, snapshot) => {
            if (error) reject(error)
            else resolve(
              committed 
                ? transaction.instantiateResult(snapshot.val()) 
                : undefined
            )
          })
      })
    },
    login: adminMode? noop : createLogin(firebase),
    loginAnon: adminMode? noop : createLoginAnon(firebase),
    logout: adminMode? noop : createLogout(firebase),
    signup: adminMode? noop : signup,
    onAuthStateChanged: adminMode? noop : createAuthEmitter(firebase), // @todo: fix name (not an emitter)
    shouldRefreshAuth,
    performUpdates: createPerformUpdates(firebase),
    timestamp: createSvTimestamp(firebase),
    getRef: createGetFbRef(firebase),
    newKey: createCreateNewKey(firebase),
    changePassword: changePassword(firebase),
    changeEmail: changeEmail(firebase)
  }
}