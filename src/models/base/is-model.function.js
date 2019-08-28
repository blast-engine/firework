import { isMixableInstance } from '@blast-engine/mixable'
import { Model } from './model.class'

export const isModel = thing => {
  if (!isMixableInstance(thing)) return false
  if (!thing.is(Model)) return false
  return true
}