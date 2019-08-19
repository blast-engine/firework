export const snapFullNode = async ({ query, getFbRef }) => {
  const ref = getFbRef(query.path())  
  const snapshot = await ref.once('value')
  return query.instantiate(snapshot.val())
}