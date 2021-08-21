import { snapFullNode } from './full-node'
import { snapSelectionByKeys } from './selection-by-keys'

export const snapQuery = async ({ query, getFbRef }) => {
  switch (query.type()) {
    case 'full-node':
    case 'once-per-child':
      return snapFullNode({ query, getFbRef })
    case 'array-of-child-keys':
      return snapSelectionByKeys({ query, getFbRef })
    default:
      throw new Error('query type is wtf')
  }
}