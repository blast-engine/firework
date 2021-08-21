import { createFullNodeWatcher } from './full-node'
import { createOncePerChildWatcher } from './once-per-child'
import { createSelectionByKeysWatcher } from './selection-by-keys'

export const createCreateWatcher = ({ getFbRef }) => ({ query, onResultUpdated, ...more }) => {

  switch (query.type()) {

    case 'full-node':
      return createFullNodeWatcher({ query, getFbRef, onResultUpdated, ...more })

    case 'once-per-child':
      return createOncePerChildWatcher({ query, getFbRef, onResultUpdated, ...more })

    case 'array-of-child-keys':
      return createSelectionByKeysWatcher({ query, getFbRef, onResultUpdated, ...more })

    default:
      console.log('query.type is fucked.')
      break
      
  }
  
}