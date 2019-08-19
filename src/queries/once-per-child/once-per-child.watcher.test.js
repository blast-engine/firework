import { k, v } from '@smackchat/utils'
import { assert } from '@smackchat/utils'
import { createMockGetFbRef } from '../../firebase-services'
import { nodeDataExamples, nodeClassExamples } from '../../models'
import { oncePerChildQueryExamples } from './once-per-child.query.examples'
import { createOncePerChildWatcher } from './once-per-child.watcher'


describe('createOncePerChildWatcher', () => {
  it('works', () => {
    const { fbRefs, getFbRef } = createMockGetFbRef()
    const results = []
    const watcher = createOncePerChildWatcher({ 
      query: oncePerChildQueryExamples.armin, 
      getFbRef, 
      onResultUpdated: () => results.push(watcher.result)
    })

    const arminPath = oncePerChildQueryExamples.armin.path()

    assert([
      k(fbRefs).length === 1,
      fbRefs[arminPath],
      results.length === 0
    ])

    fbRefs[arminPath].triggerChildAddedEvent({ 
      key: 'scarf', val: 'blue'
    })

    assert([
      k(fbRefs).length === 1,
      results.length === 1,
      results[0].is(nodeClassExamples.ArminNode),
      results[0].data.scarf === 'blue'
    ])


  })
})