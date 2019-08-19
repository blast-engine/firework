import { isModel, Struct } from './models'

export const isReady = (...provisions) => provisions.every(p => {
  if (p === undefined) return false
  if (p === null) return true
  if (isModel(p) && p.is(Struct)) return p.isLoaded()
  else return true
})