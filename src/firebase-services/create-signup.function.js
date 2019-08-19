export const createSignup = firebase => ({ email, password }) => {
  const credential = firebase.auth.EmailAuthProvider.credential(email, password)
  return firebase.auth().currentUser.linkWithCredential(credential)
}