export const createCreateNewKey = firebase => path => {
  return firebase.database().ref(path).push().key
}
