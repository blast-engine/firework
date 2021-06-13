export const createMockGetFbRef = () => {
  const fbRefs = {}

  const getFbRef = path => {
    if (!fbRefs[path])
      fbRefs[path] = {
        _handlers: {
          value: [],
          child_added: [],
          child_removed: [],
          child_changed: [],
          child_moved: []
        },

        triggerValueEvent({ val }) {
          this._handlers.value.forEach(h => h({ 
            val() { return val }
          }))
        },

        triggerChildAddedEvent({ val, key }) {
          this._handlers.child_added.forEach(h => h({ 
            val() { return val },
            key
          }))
        },
      
        on(event, handler) {
          this._handlers[event].push(handler)
        },
      
        off(event, handler) {
          this._handlers[event] = this._handlers[event].filter(h => h !== handler)
        }
      }

    return fbRefs[path]
  }

  return {
    fbRefs,
    getFbRef
  }
}