import { Kernel } from './kernel'
import { createCreateWatcher, snapQuery } from './queries'
import { createFirebaseAdapter } from './firebase-adapter-live'
import { createMockFirebaseAdapter } from './firebase-adapter-mock'
import { createFireworkConnect } from './react-bindings'

// @todo: add rules interpreter
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
      : createFirebaseAdapter({ firebase, adminMode })

    const root = instantiateRootModel({ 
      fbService: {
        timestamp: fbAdapter.timestamp, 
        newKey: fbAdapter.newKey
      } 
    })

    const fw = new Kernel({
      createWatcher: createCreateWatcher({ getFbRef: fbAdapter.getRef }),
      snapQuery,
      onAuthStateChanged: fbAdapter.onAuthStateChanged,
      fbService: fbAdapter,
      root,
      adminMode,
      autoAnon
    })

    if (withReactBindings)
      fw.connect = createFireworkConnect({ fwService: fw })

    return fw

  }