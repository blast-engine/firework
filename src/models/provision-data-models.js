import * as base from './base'
import * as node from './node'

export const provisionDataModels = provisions => {
  const ms = {}
  const modelClassProvisions = { ...provisions, models: ms  }

  ms.Model = base.createModelClass(modelClassProvisions)
  ms.LoadableModel = base.createLoadableModelClass(modelClassProvisions)
  ms.NodeRef = node.createNodeClass(modelClassProvisions)
  
  return ms
}

