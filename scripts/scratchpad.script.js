const utils = require('@blast-engine/utils')
const {  } = require('@blast-engine/mixable')
const fw = require('../dist/firework')
const mfc = require('./mock-firebase-client')
const { createMockFirebaseAdapter } = require('./mock-firebase-adapter')
const entities = require('./entities')

e = entities
m = mfc
u = utils

// @todo: this goes in firework
const createFireworkService = ({ rootRef, fbAdapter }) => {
  k = new fw.Kernel({
    createWatcher: fw.createCreateWatcher({ getFbRef: fbAdapter.getRef }),
    snapQuery: fw.snapQuery,
    onAuthStateChanged: fbAdapter.onAuthStateChanged,
    fbService: fbAdapter,
    rootRef
  })
  return k
}

// testing utils ---

createMockFirebaseService = ({} = {}) => {
  mockFbAdapter = createMockFirebaseAdapter()
  rootRef = new entities.RootRef({
    timestamp: mockFbAdapter.timestamp,
    newKey: mockFbAdapter.newKey
  })
  fws = createFireworkService({ 
    rootRef, 
    fbAdapter: mockFbAdapter
  })
  return fws
}

prepareFireworkState = async ({ fireworkService, actions = [] }) => {
  if (!fireworkService) throw new Error('fireworkService not provided')
  let i = 0
  while (i < actions.length) {
    await actions[i++]({ 
      fireworkService, 
      fws: fireworkService 
    })
  }
  return fireworkService
}

prepareMockFireworkState = async ({ actions = [] }) => {
  const fireworkService = createMockFirebaseService()
  return prepareFireworkState({ fireworkService, actions })
}

testPrepare = async () => {
  return prepareMockFireworkState({ 
      actions: [
          async ({ fws }) => {
              const sc = await fws.snap(rootRef.serverConfigRef().query())
              await fws.update(sc.setCloudServerDisabled(false))
          }
      ] 
  })
}

testPrepare()

setInterval(() => null, 20000)


// ;(async () => {
//     const fws = await prepareMockFireworkService({ 
//         actions: [
//             async ({ fs }) => {
//                 fs.
//             }
//         ] 
//     })
//     return fws
// })()
