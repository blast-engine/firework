export const createMockCreateWatcher = () => {
  const activeWatchers = []

  const createWatcher = ({ query, getFbRef, onResultUpdated }) => {
    const watcher = {
      query,
      result: undefined,
      onResultUpdated,
      kill() {
        activeWatchers.splice(activeWatchers.indexOf(this), 1)
      },
      m_updateResult(newResult) {
        this.result = newResult
        this.onResultUpdated()
      }
    }
    activeWatchers.push(watcher)
    return watcher
  }

  return {
    activeWatchers,
    createWatcher
  }
}