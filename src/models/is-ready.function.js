import { isLoadableModel } from './base'

export const isReady = (...provisions) => provisions.every(p => {
  if (p === undefined) return false
  if (p === null) return true
  if (isLoadableModel(p)) return p.isLoaded()
  else return true
})