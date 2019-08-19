import { snapFullNode } from './full-node'

export const snapQuery = async ({ query, getFbRef }) => {
  switch (query.type()) {
    case 'full-node':
    case 'array-of-child-keys':
    case 'once-per-child':
      return snapFullNode({ query, getFbRef })
    default:
      throw new Error('query type is wtf')
  }
}