import { k, v } from '@blast-engine/utils'
import { assert } from '@blast-engine/utils'
import { createMockGetFbRef } from '../../firebase-services'
import { nodeDataExamples, nodeClassExamples } from '../../models'
import { arrayOfChildKeysQueryExamples } from './array-of-child-keys.query.examples'
import { createArrayOfChildKeysWatcher } from './array-of-child-keys.watcher'


describe('createArrayOfChildKeysWatcher', () => {
  it('works', () => {
    const { fbRefs, getFbRef } = createMockGetFbRef()
    const results = []
    const watcher = createArrayOfChildKeysWatcher({ 
      query: arrayOfChildKeysQueryExamples.armin, 
      getFbRef, 
      onResultUpdated: () => results.push(watcher.result)
    })

    const arminPath = arrayOfChildKeysQueryExamples.armin.path()
    const armin = arrayOfChildKeysQueryExamples.armin

    const keys = k
    const pathToChild = arminPath + '/scarf'
    const n = nodeClassExamples

    assert([
      keys(fbRefs).length === 2,
      fbRefs[pathToChild],
      results.length === 0
    ])

    fbRefs[pathToChild].triggerValueEvent({ 
      val: 'red'
    })

    assert([
      keys(fbRefs).length === 2,
      results.length === 1,
      results[0].is(n.ArminNode),
      results[0].data.scarf === 'red'
    ])
  })
})