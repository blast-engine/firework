export const createLoginAnon = firebase => () => { 
  return firebase.auth().signInAnonymously()
}