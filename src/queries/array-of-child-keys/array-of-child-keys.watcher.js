import { doAsync, v } from '@blast-engine/utils'

export const createArrayOfChildKeysWatcher = ({ query, getFbRef, prevWatcher, onResultUpdated }) => {

  const watcher = {
    refListeners: {},
    data: {},
    lastInstantiated: undefined,
    result: undefined,
    onResultUpdated
  }

  const buildUsingExisting = (
    prevWatcher && 
    prevWatcher.query.type === query.type && 
    prevWatcher.query.path === query.path
  )  

  if (buildUsingExisting) {
    watcher.data = prevWatcher.data
  }

  const createRefListener = ({ path }) => {
    const listener = { path, handlers: [] }
    const internalHandler = (...args) => 
      setTimeout(() => listener.handlers.forEach(h => h.fn(...args)))
    
    const ref = getFbRef(path)

    listener.ref = ref
    listener.dead = false
    listener.started = false

    listener.attach = ({ fn, identifier }) => {
      if (listener.handlers.find(h => h.identifier === identifier)) return
      listener.handlers = listener.handlers.filter(h => h.identifier !== identifier)
      listener.handlers = listener.handlers.concat({ fn, identifier })
    }

    listener.detach = ({ identifier }) => {
      listener.handlers = listener.handlers.filter(h => h.identifier !== identifier)
      if (listener.handlers.length) return
      ref.off('value', internalHandler)
      listener.dead = true
    } 

    listener.start = () => {
      if (listener.started) return
      ref.on('value', internalHandler)
      listener.started = true
    }

    return listener
  }

  const handlerWithKey = key => snapshot => {
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
      const path = query.path() + '/' + key
      const handler = handlerWithKey(key)
      const refListener = (buildUsingExisting && prevWatcher.refListeners[path])
        ? prevWatcher.refListeners[path]
        : createRefListener({ path }) 
      refListener.attach({ fn: handler, identifier: watcher })
      refListener.start()
      watcher.refListeners[path] = refListener
    })
    
    if (!query.childKeys().length)
      doAsync(() => {
        watcher.result = query.instantiate({})
        watcher.onResultUpdated()
      })
  }

  watcher.start = start
  watcher.kill = () => {
    watcher.dead = true
    v(watcher.refListeners)
      .forEach(rl => rl.detach(watcher))
  }

  return watcher

}