import { k, v } from '@smackchat/utils'
import { assert } from '@smackchat/utils'
import { createMockGetFbRef } from '../../firebase-services'
import { createFullNodeWatcher } from './full-node.watcher'
import { nodeDataExamples, nodeClassExamples } from '../../models/node/create-node-class.function.examples'
import { fullNodeQueryExamples } from '../../queries/full-node/full-node.query.examples'

describe('FullNodeWatcher', () => {

  it('works', () => {
    const { fbRefs, getFbRef } = createMockGetFbRef()
    const results = []
    const watcher = createFullNodeWatcher({ 
      query: fullNodeQueryExamples.armin, 
      getFbRef, 
      onResultUpdated: () => results.push(watcher.result)
    })
    
    const arminPath = fullNodeQueryExamples.armin.path()
    const keys = k
    const pathToChild = arminPath + '/scarf'
    const n = nodeDataExamples
    
    assert([
      k(fbRefs).length === 1,
      fbRefs[arminPath],
      results.length === 0
    ])

    fbRefs[arminPath].triggerValueEvent({ 
      val: nodeDataExamples.ArminNode.notLoaded2
    })

    assert([
      k(fbRefs).length === 1,
      results.length === 1,
      results[0].is(nodeClassExamples.ArminNode),
      results[0].data === nodeDataExamples.ArminNode.notLoaded2
    ])
  })
})