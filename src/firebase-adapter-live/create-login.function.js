export const createLogin = firebase => ({ email, password }) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}