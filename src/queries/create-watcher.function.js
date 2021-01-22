import { createFullNodeWatcher } from './full-node'
import { createOncePerChildWatcher } from './once-per-child'
import { createArrayOfChildKeysWatcher } from './array-of-child-keys'

export const createCreateWatcher = ({ getFbRef }) => ({ query, onResultUpdated, ...more }) => {

  switch (query.type()) {

    case 'full-node':
      return createFullNodeWatcher({ query, getFbRef, onResultUpdated, ...more })

    case 'once-per-child':
      return createOncePerChildWatcher({ query, getFbRef, onResultUpdated, ...more })

    case 'array-of-child-keys':
      return createArrayOfChildKeysWatcher({ query, getFbRef, onResultUpdated, ...more })

    default:
      console.log('query.type is fucked.')
      break
      
  }
  
}