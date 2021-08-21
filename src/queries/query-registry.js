import { 
  SelectionByKeysQuery, 
  snapSelectionByKeys, 
  createSelectionByKeysWatcher 
} from './selection-by-keys'

export const QUERY_TYPES = {
  selectionByKeys: {
    query: SelectionByKeysQuery,
    snapper: snapSelectionByKeys,
    watcher: createSelectionByKeysWatcher
  }
}