import { Kernel } from './kernel'
import { createCreateWatcher, snapQuery } from './queries'
import { createFirebaseAdapter } from './firebase-adapter-live'
import { createMockFirebaseAdapter } from './firebase-adapter-mock'

// @todo: do adminMode properly (there's no auth in that case)
export const createFireworkService = 
  ({ 
    firebase = null,
    instantiateRootModel = null,  
    mock = false, 
    adminMode = false, 
    withReactBindings = false,
    autoAnon = false
  }) => {

    if (!mock && !firebase) 
      throw new Error('must provide firebase client if not mock')

    const fbAdapter = mock 
      ? createMockFirebaseAdapter()
      : createFirebaseAdapter({ firebase })

    const root = instantiateRootModel({ 
      fbService: {
        timestamp: fbAdapter.timestamp, 
        newKey: fbAdapter.newKey
      } 
    })

    const fwService = new Kernel({
      createWatcher: createCreateWatcher({ getFbRef: fbAdapter.getRef }),
      snapQuery,
      onAuthStateChanged: fbAdapter.onAuthStateChanged,
      fbService: fbAdapter,
      root,
      autoAnon
    })

    if (withReactBindings)
      fwService.connect = createFireworkConnect({ fwService })

    return fwService

  }