export const createFullNodeWatcher = ({ query, getFbRef, onResultUpdated }) => {

  let ref
  let watcher = {
    result: undefined,
    onResultUpdated,
  }

  const handler = snapshot => {
    watcher.result = query.instantiate(snapshot.val())
    watcher.onResultUpdated()
  }

  const start = () => {
    ref = getFbRef(query.path())
    ref.on('value', handler)
  }

  watcher.start = start
  watcher.kill = () => ref.off('value', handler)

  return watcher

}