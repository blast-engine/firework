import { doAsync } from '@blast-engine/utils'

export const createArrayOfChildKeysWatcher = ({ query, getFbRef, prevWatcher, onResultUpdated }) => {

  const watcher = {
    activeRefs: [],
    data: {},
    lastInstantiated: undefined,
    result: undefined,
    onResultUpdated
  }

  const builtOnTopOfExisting = (
    prevWatcher && 
    prevWatcher.query.type === query.type && 
    prevWatcher.query.path === query.path
  )  

  console.log({
    builtOnTopOfExisting,
    prevWatcher,
    watcher
  })

  let ignoreDataStream = false 

  if (builtOnTopOfExisting) {
    watcher.data = prevWatcher.data
    watcher.lastInstantiated = prevWatcher.lastInstantiated
    watcher.result = prevWatcher.result
  }

  const handlerWithKey = key => snapshot => {
    if (ignoreDataStream) return

    watcher.data = { ...watcher.data, [key]: snapshot.val() }

    const haveAllKeys = query.childKeys()
      .every(key => watcher.data[key] !== undefined) 

    if (haveAllKeys) {
      watcher.lastInstantiated = query.instantiate(watcher.data, { 
        previous: watcher.lastInstantiated,
        updatedKey: key
      })

      if (
        typeof query.shouldEmitNext !== 'function'
        || !watcher.result
        || query.shouldEmitNext(watcher.result, watcher.lastInstantiated)
      ) {
        watcher.result = watcher.lastInstantiated
        watcher.onResultUpdated()
      }
    }
  }

  const start = () => {
    query.childKeys().forEach(key => {
      const ref = getFbRef(query.path() + '/' + key)
      const handler = handlerWithKey(key)
      const ignoreSynchronousDataEvents = (
        builtOnTopOfExisting &&
        prevWatcher.query.childKeys().includes(key)
      )
      if (ignoreSynchronousDataEvents) ignoreDataStream = true
      ref.on('value', handler)
      ignoreDataStream = false
      watcher.activeRefs.push({ ref, handler })
    })
    
    if (!query.childKeys().length)
      doAsync(() => {
        watcher.result = query.instantiate({})
        watcher.onResultUpdated()
      })
  }

  watcher.start = start
  watcher.kill = () => watcher.activeRefs
      .forEach(({ ref, handler }) => ref.off('value', handler))

  return watcher

}