import { nodeClassExamples } from '../../models'
import { FullNodeQuery } from './full-node.query'

const { ArminNode, SantiNode } = nodeClassExamples

export const fullNodeQueryExamples = {
  armin: new FullNodeQuery({
    path: 'armin/ghobadi',
    instantiate: data => new ArminNode({ path: 'armin/ghobadi', data })
  }),

  armin2: new FullNodeQuery({
    path: 'armin/ghobadi',
    instantiate: data => new ArminNode({ path: 'armin/ghobadi', data })
  }),
  
  santi: new FullNodeQuery({
    path: 'santi/elus',
    instantiate: data => new SantiNode({ path: 'armin/ghobadi', data })
  })
}