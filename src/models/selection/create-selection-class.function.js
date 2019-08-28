import { createMixableClass, isMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { Struct, Ref } from '../base'
import { SelectionRef } from './selection-ref.class'
import { SelectionStruct } from './selection-struct.class'
import { Selection } from './selection.class'

export function createSelectionClass({
  name,
  itemModel,
  ref, 
  struct, 
  full
}) {
  ensure(
    'itemModel is a full model', 
    () => isMixableClass(itemModel) && itemModel.inheritsFrom(Struct, Ref), 
    'createSelectionClass()'
  )

  const SelectionClassRef = createMixableClass({
    name: `${name}_ref`,
    inherits: [ SelectionRef ],
    staticProps: { 
      full: () => SelectionClassFull,
      itemRef: () => itemModel.ref()
    },
    body: ref
  })

  const SelectionClassStruct = createMixableClass({
    name: `${name}_struct`,
    inherits: [ SelectionStruct ],
    staticProps: { 
      full: () => SelectionClassFull,
      itemStruct: () => itemModel.struct()
    },
    body: struct
  })

  const SelectionClassFull = createMixableClass({
    name: name,
    inherits: [ SelectionClassStruct, SelectionClassRef, Selection ],
    staticProps: { 
      ref: () => SelectionClassRef, 
      struct: () => SelectionClassStruct,
      full: () => SelectionClassFull,
      item: () => itemModel
    },
    body: full
  })

  return SelectionClassFull
  
}