import { Kernel } from './kernel'
import { createCreateWatcher, snapQuery } from './queries'

// @todo: do adminMode properly (there's no auth in that case)
export const createFireworkService = ({ root, fbAdapter, opts = {} }) => {
  return new Kernel({
    createWatcher: createCreateWatcher({ getFbRef: fbAdapter.getRef }),
    snapQuery,
    onAuthStateChanged: fbAdapter.onAuthStateChanged,
    fbService: fbAdapter,
    root,
    autoAnon: opts.autoAnon
  })
}