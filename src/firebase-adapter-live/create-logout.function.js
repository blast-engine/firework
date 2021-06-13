export const createLogout = firebase => () => {
  return firebase.auth().signOut()
}
