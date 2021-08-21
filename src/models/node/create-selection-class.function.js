import { createMixableClass, isMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { Node } from '../node'
import { SelectionRef } from './selection-ref.class'
import { Selection } from './selection-full.class'

export function createSelectionClass({
  name,
  ItemModel,
  ref, 
  full
}) {
  ensure(
    'ItemModel is a full model', 
    () => isMixableClass(ItemModel) && ItemModel.inheritsFrom(Node), 
    'createSelectionClass()'
  )

  const SelectionClassRef = createMixableClass({
    name: `${name}_ref`,
    inherits: [ SelectionRef ],
    staticProps: { 
      full: () => SelectionClassFull,
      itemRef: () => ItemModel.ref()
    },
    body: ref
  })

  const SelectionClassFull = createMixableClass({
    name: name,
    inherits: [ SelectionClassRef, Selection ],
    staticProps: { 
      ref: () => SelectionClassRef, 
      full: () => SelectionClassFull,
      item: () => ItemModel
    },
    body: full
  })

  return SelectionClassFull
  
}