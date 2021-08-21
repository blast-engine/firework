export const snapSelectionByKeys = async ({ query, getFbRef }) => {

  let result = {}
  const listRef = getFbRef(query.path())
  
  await Promise.all(
    query.keys().map(async key => {
      const snapshot = await listRef.child(key).once('value')
      result[key] = snapshot.val()
    })
  )
  
  return query.instantiate(result)
}