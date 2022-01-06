import { isLoadableModel } from './base'

export const isReady = (...models) => models.every(m => {
  if (m === undefined) return false
  if (m === null) return true
  if (isLoadableModel(m)) return m.isLoaded()
  else return true
})