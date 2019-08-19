export const createSvTimestamp = firebase => () => {
  return firebase.database.ServerValue.TIMESTAMP
}