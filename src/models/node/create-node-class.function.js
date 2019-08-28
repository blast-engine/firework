import { createMixableClass } from '@blast-engine/mixable'
import { NodeRef } from './node-ref.class'
import { NodeStruct } from './node-struct.class'
import { Node } from './node-full.class'

// @todo: get rid of node-ref.class.js and other files like that, leave only this funciton
//        problem: order of inheritance, example: override isLoaded in struct gets 
//        overridden back to original struct version because full node inherits from original struct as well

export const createNodeClass = ({
  name = '',
  inherits = [],
  ref = class {},
  struct = class {},
  full = class {}
}) => {

  const NodeClassRef = createMixableClass({
    name: `${name}_ref`,
    inherits: inherits.map(Model => Model.ref()).concat([ NodeRef ]),
    staticProps: { full: () => NodeClassFull },
    body: ref
  })

  const NodeClassStruct = createMixableClass({
    name: `${name}_struct`,
    inherits: inherits.map(Model => Model.struct()).concat([ NodeStruct ]),
    staticProps: { full: () => NodeClassFull },
    body: struct
  })

  const NodeClassFull = createMixableClass({
    name: name,
    // @todo: if we put Node last here, then overridden isLoaded gets brought back to original
    inherits: inherits.concat([ Node, NodeClassRef, NodeClassStruct ]),
    staticProps: { 
      full: () => NodeClassFull, 
      ref: () => NodeClassRef, 
      struct: () => NodeClassStruct 
    },
    body: full
  })

  return NodeClassFull

}