import { isMixableInstance } from '@blast-engine/mixable'
import { Model } from './model.class'
import { LoadableModel } from './loadable-model.class'

export const isModel = thing => {
  if (!isMixableInstance(thing)) return false
  return thing.is(Model)
}

export const isLoadableModel = thing => {
  if (!isModel(thing)) return false
  return (typeof thing.isLoaded === 'function')
}
  