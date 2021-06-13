import { keys, flattenDeep } from '@blast-engine/utils'

export const createTransaction = arrayOfUpdates /* Array<Update> */ => {

  function nestedObjectToArrayOfIndividualUpdates(nestedObject) {
    return keys(nestedObject)
      .reduce((arrayOfIndividualUpdates, key) => {
        if ( typeof nestedObject[key] !== 'object'
          || nestedObject[key] === null
          || nestedObject[key]['.sv'] !== undefined ) // this is a firebase ServerValue special flag. should remain as object
          return [{ path: key, val: nestedObject[key] }]
            .concat(arrayOfIndividualUpdates)
        else
          return nestedObjectToArrayOfIndividualUpdates(nestedObject[key])
            .map(fbUpdate => ({ path: `${key}/${fbUpdate.path}`, val: fbUpdate.val }))
            .concat(arrayOfIndividualUpdates)

      }, [])
  }

  var arrayOfArraysOfIndividualUpdates = arrayOfUpdates
    .map(nestedObject => nestedObjectToArrayOfIndividualUpdates(nestedObject))
    
  const arrayOfFbUpdateGroups = arrayOfArraysOfIndividualUpdates
    .map(fbUpdates => fbUpdates.reduce((fbUpdatesGroup, fbUpdate) => {
  		return Object.assign({},
  			fbUpdatesGroup,
        { [fbUpdate.path]: fbUpdate.val } )
  	}, []))

  const fbTransaction = arrayOfFbUpdateGroups
    .reduce((fbTransaction, fbUpdatesGroup) => {
  		return Object.assign({},
  			fbTransaction,
  			fbUpdatesGroup )
  	}, {})

  return fbTransaction

}

export const transactionsAreSame = ( t1, t2 ) => {

  if ( keys( t1 ).length !== keys( t2 ).length )
    return false

  return keys( t1 ).every(k => typeof t2[k] == 'object' || t1[k] == t2[k] )

}


export const createPerformUpdates = 
  firebase => 
  updates => {
    const updatesArray = Array.isArray(updates) ? updates : [ updates ]
    const flatUpdates = flattenDeep(updatesArray)
    return firebase.database().ref().update(createTransaction(flatUpdates))  
  }
    

