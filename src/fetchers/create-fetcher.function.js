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
    args,
    debug: parseDebugOpts(args.debug),
    keepOldResultUntilNew: 
      typeof args.keepOldResultUntilNew === 'undefined' 
        ? true 
        : args.keepOldResultUntilNew,
    ...deriveInstructions(args),
    equals: other => {
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