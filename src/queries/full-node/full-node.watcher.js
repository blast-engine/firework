export const createFullNodeWatcher = ({ query, getFbRef, onResultUpdated }) => {

  let ref
  let watcher = {
    lastInstantiated: undefined,
    result: undefined,
    onResultUpdated,
  }

  const handler = snapshot => {
    watcher.lastInstantiated = query.instantiate(snapshot.val())
    if (
      typeof query.shouldEmitNext !== 'function'
      || !watcher.result
      || query.shouldEmitNext(watcher.result, watcher.lastInstantiated)
    ) {
      watcher.result = watcher.lastInstantiated
      watcher.onResultUpdated()
    }
  }

  const start = () => {
    ref = getFbRef(query.path())
    ref.on('value', handler)
  }

  watcher.start = start
  watcher.kill = () => ref.off('value', handler)

  return watcher

}