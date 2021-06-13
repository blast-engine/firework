const admin = require('firebase-admin')
const firework = require('@blast-engine/firework')
const { getOrSelectCurrentContext } = require('@blast-engine/context')
const utils = require('@blast-engine/utils')
const entities = require('./entities')
const { runScript } = require('./utils')
const fwlib = require('../dist/firework') 

runScript(async () => {

  context = await getOrSelectCurrentContext({ directory: __dirname })

  const initFbAdmin = () => {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(context.serviceKey),
        databaseURL: context.firebase.public.databaseURL
      })
    }
    return admin
  }
  
  e = entities
  u = utils
  firebase = initFbAdmin()

  fbAdapter = fwlib.createFirebaseAdapter({ firebase, adminMode: true })
  
  rootRef = new entities.RootRef({
    timestamp: fbAdapter.timestamp,
    newKey: fbAdapter.newKey
  })
  
  fws = fwlib.createFireworkService({ 
    rootRef: rootRef,
    fbAdapter 
  })

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
  
  testPrepare = async ({ value }) => {
    return prepareFireworkState({ 
        fireworkService: fws,
        actions: [
            async ({ fws }) => {
                const sc = await fws.snap(rootRef.serverConfigRef().query())
                await fws.update(sc.setCloudServerDisabled(value))
            }
        ] 
    })
  }
  

})