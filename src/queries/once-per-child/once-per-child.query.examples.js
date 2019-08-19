import { nodeClassExamples } from '../../models'
import { OncePerChildQuery } from './once-per-child.query'

const { ArminNode, SantiNode } = nodeClassExamples

export const oncePerChildQueryExamples = {
  armin: new OncePerChildQuery({
    path: 'armin/ghobadi',
    instantiate: data => new ArminNode({ path: 'armin/ghobadi', data })
  }),

  armin2: new OncePerChildQuery({
    path: 'armin/ghobadi',
    instantiate: data => new ArminNode({ path: 'armin/ghobadi', data })
  }),
  
  santi: new OncePerChildQuery({
    path: 'santi/elus',
    instantiate: data => new SantiNode({ path: 'armin/ghobadi', data })
  })
}