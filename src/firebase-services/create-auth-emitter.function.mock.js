export const createMockAuthEmitter = () => {
  let authState = undefined
  const handlers = []

  const onAuthStateChanged = handler => {
    handlers.push(handler)
    handler(authState)
  }

  const updateAuthState = fbAuth => {
    authState = fbAuth
    handlers.forEach(h => h(authState))
  }

  return {
    onAuthStateChanged,
    updateAuthState
  }
}