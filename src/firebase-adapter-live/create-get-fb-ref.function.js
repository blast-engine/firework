export const createGetFbRef = firebase => { 
  const dbService = firebase.database()
  return dbService.ref.bind(dbService)
}