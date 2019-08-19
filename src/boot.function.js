import { Kernel } from './kernel'
import { createCreateWatcher, snapQuery } from './queries'
import { createFirebaseService } from './firebase-services'

// @todo: remove redundancy in kernel args
// @todo: do adminMode properly (there's no auth in that case)
// @todo: remove rootRef
export const boot = ({ rootRef, Root, firebase, adminMode }) => {
  const fbService = createFirebaseService({ firebase, adminMode })
  return new Kernel({
    createWatcher: createCreateWatcher({ getFbRef: fbService.getRef }),
    snapQuery,
    onAuthStateChanged: fbService.onAuthStateChanged,
    fbService,
    rootRef,
    Root
  })
}