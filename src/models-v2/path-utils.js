import { isArray, isString } from '@blast-engine/utils'

export const strPathIsValid = strPath => true
export const arrPathIsValid = arrPath => true

export const pathIsValid = path => {
  if (!path) return false
  if (isString(path)) return strPathIsValid(path)
  if (isArray(path)) return arrPathIsValid(path)
  return false
}

export const pathAsArray = path => {
  if (!path) return []
  if (isArray(path)) return path

  const slashChunks = path.split('/') 
  const arrPath = slashChunks.reduce((arrPath, slashChunk) => {
    const dotChunks = slashChunk.split('.')
    return arrPath.concat(dotChunks)
  }, [])
  
  return arrPath
}

export const pathAsString = (path, delimiter = '/') => {
  if (!path) return ''
  if (isString(path)) return path

  return path.join(delimiter)
}