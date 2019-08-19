import { createFullNodeWatcher } from './full-node'
import { createOncePerChildWatcher } from './once-per-child'
import { createArrayOfChildKeysWatcher } from './array-of-child-keys'

export const createCreateWatcher = ({ getFbRef }) => ({ query, onResultUpdated }) => {

  switch (query.type()) {

    case 'full-node':
      return createFullNodeWatcher({ query, getFbRef, onResultUpdated })

    case 'once-per-child':
      return createOncePerChildWatcher({ query, getFbRef, onResultUpdated })

    case 'array-of-child-keys':
      return createArrayOfChildKeysWatcher({ query, getFbRef, onResultUpdated })

    default:
      console.log('query.type is fucked.')
      break
      
  }
  
}