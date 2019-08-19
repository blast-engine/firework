import { ArrayOfChildKeysQuery } from './array-of-child-keys.query'
import { nodeClassExamples } from '../../models'

const { ArminNode, SantiNode } = nodeClassExamples

export const arrayOfChildKeysQueryExamples = {
  armin: new ArrayOfChildKeysQuery({
    path: 'armin/ghobadi',
    instantiate: data => new ArminNode({ path: 'armin/ghobadi', data}),
    childKeys: ['scarf', 'smoking']
  }), 
  santi: new ArrayOfChildKeysQuery({
    path: 'santi/elus',
    instantiate: data => new SantiNode({ path: 'santi/elus', data}),
    childKeys: ['phoneBatteryPercent']
  })
}
