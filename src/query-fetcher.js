import { createFetcher } from './fetchers/create-fetcher.function'

//   this doesnt work!

// this whole thing should be refactored away, kernel.createRequest should accept
let queryFetcherNum = 0
export const simpleQueryFetcher = query => createFetcher({
  name: 'simple-query-fetcher-' + queryFetcherNum++ // this is because we use name in equals() REFACTOR
}, () => ({
  steps: [{
    name: 'node',
    requires: [],
    query: () => query
  }],
  final: {
    take: ['node'],
    instantiate: ({ node }) => node
  }
}))