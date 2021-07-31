import { keys } from '@blast-engine/utils'

const parseDebugOpts = given => {
  if (!given) 
    return {}

  if (typeof given !== 'object')
    return { 
      kernel: true 
    }
  
  return {
    kernel: given.kernel
  }
}

export const createFetcher = 
  (opts, deriveInstructions) =>
  (args = {}) => ({
    name: opts.name,
    isFireworkInstructions: () => true,
    debug: parseDebugOpts(args.debug),
    keepOldResultUntilNew: 
      typeof args.keepOldResultUntilNew === 'undefined' 
        ? true 
        : args.keepOldResultUntilNew,
    ...deriveInstructions(args),
    args, opts,
    isFetcher: true,
    equals: other => {
      if (!other) return false
      if (opts.equals) return opts.equals(other)
      if (other.name !== opts.name) return false
      const argK = keys(args)
      const otherArgK = keys(other.args)
      return (
        argK.length === otherArgK.length
        && argK.every(k => otherArgK.some(k2 => (
          (k === k2) && (args[k] === other.args[k])
        )))
      )
    }
  })

export const instructionsFromQuery = query =>
  createFetcher({
    name: 'fetch-query',
    equals: other => query.equals(other.opts.query),
    query
  }, () => ({
    steps: [{
      name: 'queryNode',
      query: ({ root }) => query
    }],
    final: {
      take: [ 'queryNode' ],
      instantiate: ({ queryNode }) => queryNode
    }
  }))()