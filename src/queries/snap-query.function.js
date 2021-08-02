import { snapFullNode } from './full-node'
import { snapArrayOfChildKeys } from './array-of-child-keys/array-of-child-keys.snapper'


export const snapQuery = async ({ query, getFbRef }) => {
  switch (query.type()) {
    case 'full-node':
    case 'once-per-child':
      return snapFullNode({ query, getFbRef })
    case 'array-of-child-keys':
      return snapArrayOfChildKeys({ query, getFbRef })
    default:
      throw new Error('query type is wtf')
  }
}