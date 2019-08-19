import { env } from './environment'

export const ensure = (rule, pass, context) => {
  if (env.isProd) return
  else {

    let ok
    try { ok = pass() }
    catch (e) { 
      if (env.isTest) throw e
      else ok = false 
    }

    if (!ok) {
      const msg = 
      'INVARIANT VIOLATION'
      + (context ? ' in ' + context : '')
      +'. RULE: ' + rule

      if (env.isDev) console.error(msg)
      else if (env.isTest) throw new Error(msg)
    }
    
  }
}
