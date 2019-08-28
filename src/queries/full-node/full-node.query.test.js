import { assert } from '@blast-engine/utils'
import { fullNodeQueryExamples } from './full-node.query.examples'

describe('FullNodeQuery', () => {
  it('works', () => {
    const { armin, armin2, santi } = fullNodeQueryExamples

    assert([
      armin.equals(armin2),
      armin.equals(santi) === false,
      armin.path() === 'armin/ghobadi'
    ])
  })
})