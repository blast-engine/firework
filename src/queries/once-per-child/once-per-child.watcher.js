
export const createOncePerChildWatcher = ({ query, getFbRef, onResultUpdated }) => {
  
  const ref = getFbRef(query.path())

  let data = {}

  let watcher = {
    result: undefined,
    onResultUpdated
  }

  const childAddedHandler = snapshot => {
    data[snapshot.key] = snapshot.val()
    watcher.result = query.instantiate(data)
    watcher.onResultUpdated()
  }

  const childRemovedHandler = snapshot => {
    delete data[snapshot.key]
    watcher.result = query.instantiate(data)
    watcher.onResultUpdated()
  }

  const childUpdatedHandler = snapshot => {
    data[snapshot.key] = snapshot.val()
    watcher.result = query.instantiate(data)
    watcher.onResultUpdated()
  }

  const start = () => {
    ref.on('child_added', childAddedHandler)
    ref.on('child_removed', childRemovedHandler)
    ref.on('child_changed', childUpdatedHandler)

    // in case it's null, we trigger it manually once
    // if its null, none of the children will fire, and will remain undefined
    setTimeout(() => {
      watcher.result = query.instantiate(data)
      watcher.onResultUpdated()
    }, 200)
  }

  watcher.start = start
  watcher.kill = () => {
    ref.off('child_added', childAddedHandler),
    ref.off('child_removed', childRemovedHandler)
    ref.off('child_changed', childUpdatedHandler)
  }

  return watcher

}