export const snapArrayOfChildKeys = async ({ query, getFbRef }) => {

  let result = {}
  const listRef = getFbRef(query.path())
  
  await Promise.all(
    query.childKeys().map(async key => {
      const snapshot = await listRef.child(key).once('value')
      result[key] = snapshot.val()
    })
  )
  
  return query.instantiate(result)
}