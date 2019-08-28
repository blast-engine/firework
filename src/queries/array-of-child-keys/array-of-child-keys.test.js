import { assert } from '@blast-engine/utils'
import { arrayOfChildKeysQueryExamples } from './array-of-child-keys.query.examples'

describe('create', () => {
  it('works', () => {
    const { armin, santi } = arrayOfChildKeysQueryExamples

    assert([
      armin.equals(santi) === false
    ])
  })
})