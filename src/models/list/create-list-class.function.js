import { createMixableClass, isMixableClass } from '@smackchat/mixable'
import { ensure } from '../../ensure.function'
import { Ref, Struct } from '../base'
import { ListRef } from './list-ref.class'
import { ListStruct } from './list-struct.class'
import { List } from './list.class'

export function createListClass({
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

  const ListClassRef = createMixableClass({
    name: `${name}_ref`,
    inherits: [ ListRef ],
    staticProps: { 
      full: () => ListClassFull,
      itemRef: () => itemModel.ref()
    },
    body: ref
  })
  
  const ListClassStruct = createMixableClass({
    name: `${name}_struct`,
    inherits: [ ListStruct ],
    staticProps: { 
      full: () => ListClassFull,
      itemStruct: () => itemModel.struct()
    },
    body: struct
  })

  const ListClassFull = createMixableClass({
    name: name,
    inherits: [ ListClassStruct, ListClassRef, List ],
    staticProps: { 
      ref: () => ListClassRef, 
      struct: () => ListClassStruct,
      full: () => ListClassFull,
      item: () => itemModel
    },
    body: full
  })

  return ListClassFull

}