import { createMixableClass } from '@blast-engine/mixable'
import { Full } from '../base'
import { NodeRef } from './node-ref.class'
import { NodeStruct } from './node-struct.class'

export const Node = createMixableClass({
  name: 'Node',
  inherits: [ Full, NodeStruct, NodeRef ],
  body: class {

    initIfEmpty() {
      // empty object is an empty update
      return this.isEmpty() ? this.initialize() : {}
    }

    get(path) { return this._data(path) }
    
  }
})