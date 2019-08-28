import { createMixableClass, isMixableClass } from '@blast-engine/mixable'
import { objMap, keys, values, kv, objForEach } from '@blast-engine/utils'
import { Assembly } from './assembly.class'

export function createAssemblyClass({
  name,
  memberModels = {}, 
  portMethods,
  detachableMembers = [],
  body = class {}
}) {

  // standardize portMethods
  portMethods = objMap(portMethods, methodPorts => methodPorts
    .map(methodPort => {
      let method, rename
      if (typeof methodPort === 'string') {
        method = methodPort
        rename = methodPort
      } else if (typeof methodPort === 'object') {
        method = methodPort.method
        rename = methodPort.rename
      } else throw new Error(`invalid methodPort (${methodPort})`)
      
      return { method, rename }
    })
  )
  
  // --- full

  objForEach(portMethods, (methodPorts, memberName) => {
    methodPorts.forEach(({ method, rename }) => {
      const Member = memberModels[memberName]
      if (Member.prototype[method]) 
        body.prototype[rename] = function(...args) {
          return this.members[memberName][method](...args)
        }
    })
  })

  const AssemblyModel = createMixableClass({
    name: `${name}_assembly`,
    inherits: [ Assembly ],
    staticProps: { 
      members: () => memberModels,
      detachableMembers: () => detachableMembers
    },
    body
  })

  return AssemblyModel

}