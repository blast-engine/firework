export const createFullNodeWatcher = ({ query, getFbRef, onResultUpdated }) => {

  const handler = snapshot => {
    watcher.result = query.instantiate(snapshot.val())
    watcher.onResultUpdated()
  }

  const watcher = {
    result: undefined,
    onResultUpdated,
    kill: () => ref.off('value', handler)
  }

  const ref = getFbRef(query.path())
  ref.on('value', handler)

  return watcher

}