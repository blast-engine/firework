import { assert } from '@blast-engine/utils'
import { oncePerChildQueryExamples } from './once-per-child.query.examples'

describe('createOncePerChildWatcher', () => {
  it('works', () => {
    const { armin, armin2, santi } = oncePerChildQueryExamples
    
    assert([
      armin.equals(santi) === false
    ])
  })
})