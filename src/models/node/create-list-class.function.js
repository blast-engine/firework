import { createMixableClass, isMixableClass } from '@blast-engine/mixable'
import { ensure } from '../../ensure.function'
import { Node } from '../node'
import { ListRef } from './list-ref.class'
import { List } from './list-full.class'

export function createListClass({
  name,
  ItemModel,
  ref,
  full
}) {
  ensure(
    'itemModel is a full model', 
    () => isMixableClass(ItemModel) && ItemModel.inheritsFrom(Node), 
    'createSelectionClass()'
  )

  const ListClassRef = createMixableClass({
    name: `${name}_ref`,
    inherits: [ ListRef ],
    staticProps: { 
      full: () => ListClassFull,
      itemRef: () => ItemModel.ref()
    },
    body: ref
  })

  const ListClassFull = createMixableClass({
    name: name,
    inherits: [ ListClassRef, List ],
    staticProps: { 
      ref: () => ListClassRef, 
      full: () => ListClassFull,
      item: () => ItemModel
    },
    body: full
  })

  return ListClassFull

}