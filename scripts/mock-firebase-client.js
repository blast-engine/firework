
class MockFirebaseClient {

  constructor({ state } = {}) {
    if (state) this.state = state
    else this.state = {
      data: {},
      meta: {},
      subscriptions: {},
      nextSubscriptionId: 0
    }
  }


  update = async (updateOrUpdates) => {
    const updates = Array.isArray(updateOrUpdates) 
      ? updateOrUpdates : [ updateOrUpdates ]
    const delta = updatesToDelta(updates)
    this.state.data = u.set(this.state.data, delta)
    await u.timeout(this.updateSubscriptions)
  } 

  getValueAndMetaForPathArr = (pathArr) => {
    const value = u.get(this.state.data, pathArr.join('.')) || null
    const meta = u.get(this.state.meta, pathArr.join('.')) || null
    return { value, meta }
  }

  snap = async query => {
    u.timeout(1)
    const { value } = this.getValueAndMetaForPathArr(query.path)
    const fbSnapshot = createFBSnapshot({ value })
    return fbSnapshot
  }

  updateSubscriptions = () => {
    Object.values(this.state.subscriptions).forEach(subscription => {
      const dataNode = this.getValueAndMetaForPathArr(subscription.query.path)
      subscription.last = dataNode.value
      if (subscription.lastEmitted !== subscription.last) {
        subscription.lastEmitted = subscription.last
        const fbSnapshot = createFBSnapshot({ value: subscription.lastEmitted })
        subscription.onNext(fbSnapshot)
      }
    })
  }

  createSubscription = query => {
    const subscription = { 
      id: `subscription_${this.state.nextSubscriptionId++}`, 
      lastValue: undefined,
      query,
      onNext: value => query.handler(value),
      dead: false,
      kill: () => subscription.dead = true
    }

    this.state.subscriptions[subscription.id] = subscription
    u.timeout(this.updateSubscriptions)

    return subscription
  }

  getFbRef = (pathStrOrArr) => {
    const path = (typeof pathStrOrArr === 'string')
      ? pathStrOrArr.split(/\.|\//)
      : pathStrOrArr
      
    return {
      on: (event, handler) => {
        if (event === 'value') {
          const query = { path, handler }
          this.createSubscription(query)
        }
      },
      once: async (event) => {
        if (event === 'value') {
          const query = { path }
          return this.snap(query)
        }
      }
    }
  }

  // ---- auth stuff

  anonAuthRegistry = {}
  authRegistry = {}
  authHandler = () => null
  onAuthStateChanged = handler => {
    this.authHandler = handler
    this.authHandler(this.auth)
  }
  emitUpdatedAuth = auth => this.authHandler(auth)
  auth = null

  loginAnon = async () => {
    await u.timeout(1)
    const auth = { uid: '' + Date.now(), isAnonymous: true }
    this.anonAuthRegistry[auth.uid] = auth
    this.auth = auth
    this.emitUpdatedAuth(this.auth)
  }

  signup = async ({ anonId, email, password }) => {
    await u.timeout(1)
    const anonAuth = this.anonAuthRegistry[anonId]
    if (!anonAuth) throw new Error('no anon user in registry to sign up')
    const auth = { 
      ...anonAuth,
      email, 
      password,
      isAnonymous: false
    }
    delete this.anonAuthRegistry[anonId]
    this.authRegistry[email] = auth
    this.auth = auth
    this.emitUpdatedAuth(this.auth)
  }

  login = async ({ email, password }) => {
    await u.timeout(1)
    const auth = this.authRegistry[email]
    if (!auth) throw new Error('email not registered')
    if (password !== auth.password) throw new Error('password incorrect')
    this.auth = auth
    this.emitUpdatedAuth(this.auth)
  }
  
}

// ---- helpers

const createFBSnapshot = ({ value }) => {
  return { val: () => value }
}

const updatesToDelta = arrayOfUpdates /* Array<Update> */ => {

  function nestedObjectToArrayOfIndividualUpdates(nestedObject) {
    return u.keys(nestedObject)
      .reduce((arrayOfIndividualUpdates, key) => {
        if ( typeof nestedObject[key] !== 'object'
          || nestedObject[key] === null
          || nestedObject[key]['.sv'] !== undefined ) // this is a firebase ServerValue special flag. should remain as object
          return [{ path: key, val: nestedObject[key] }]
            .concat(arrayOfIndividualUpdates)
        else
          return nestedObjectToArrayOfIndividualUpdates(nestedObject[key])
            .map(fbUpdate => ({ path: `${key}/${fbUpdate.path}`, val: fbUpdate.val }))
            .concat(arrayOfIndividualUpdates)

      }, [])
  }

  var arrayOfArraysOfIndividualUpdates = arrayOfUpdates
    .map(nestedObject => nestedObjectToArrayOfIndividualUpdates(nestedObject))

  const arrayOfFbUpdateGroups = arrayOfArraysOfIndividualUpdates
    .map(fbUpdates => fbUpdates.reduce((fbUpdatesGroup, fbUpdate) => {
      return Object.assign({},
        fbUpdatesGroup,
        { [fbUpdate.path]: fbUpdate.val } )
    }, []))

  const delta = arrayOfFbUpdateGroups
    .reduce((delta, fbUpdatesGroup) => {
      return Object.assign({},
        delta,
        fbUpdatesGroup )
    }, {})

  return delta

}

module.exports = { MockFirebaseClient }

// ---- trash for debugging -----

// mockFb = new MockFirebaseClient()
// m = mockFb
// global.mockFb = mockFb

// hydrate = async () => {
//   const q1 = {
//     path: ['a', 'b'], 
//     handler: data => console.log('q1 got update', data) 
//   }
//   mockFb.createSubscription(q1)
  
//   const ref = global.mockFb.getFbRef('eeee/werwerw')
//   ref.on('value', data => console.log('ref got update', data))  
  
//   global.mockFb.update({ 'eeee/werwerw': { 'e':'y', t: 'p' } })
//   global.mockFb.update({ 'a/b': { 'e':'y', t: 'p' } })
//   global.mockFb.update({ 'a/bber': { 'e':'y', t: 'p' } })
// }
  