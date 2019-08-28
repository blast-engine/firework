import { createMixableClass } from '@blast-engine/mixable'
import { Ref } from './ref.class'
import { Struct } from './struct.class'

export const Full = createMixableClass({
  name: 'Full',
  inherits: [ Ref, Struct ]
})