export const createAuthEmitter = firebase => { 
  const authService = firebase.auth()
  return authService.onAuthStateChanged.bind(authService)
}