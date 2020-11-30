import { doAsync } from '@blast-engine/utils'

export const createArrayOfChildKeysWatcher = ({ query, getFbRef, onResultUpdated }) => {

  let _data = {}
  let _activeRefs = []

  let watcher = {
    result: undefined,
    onResultUpdated,
  }

  const handlerWithKey = key => snapshot => {
    _data[key] = snapshot.val()
    watcher.result = query.instantiate(_data)
    watcher.onResultUpdated()
  }

  const start = () => {
    query.childKeys().forEach(key => {
      const ref = getFbRef(query.path() + '/' + key)
      const handler = handlerWithKey(key)
      ref.on('value', handler)
      _activeRefs.push({ ref, handler })
    })
    
    if (!query.childKeys().length)
      doAsync(() => {
        watcher.result = query.instantiate({})
        watcher.onResultUpdated()
      })
  }

  watcher.start = start
  watcher.kill = () => _activeRefs
      .forEach(({ ref, handler }) => ref.off('value', handler))

  return watcher

}