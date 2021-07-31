import { createMixableClass, isMixableClass } from '@blast-engine/mixable'
import { objMap, keys, values, kv, objForEach } from '@blast-engine/utils'
import { Assembly } from './assembly.class'
import { Node } from '../node'
import { List } from '../list'

const nodeMethodNames = Object.getOwnPropertyNames(Node.prototype)
const listMethodNames = Object.getOwnPropertyNames(List.prototype)
const assemblyMethodNames = Object.getOwnPropertyNames(Assembly.prototype)
const methodNamesToIgnoreInStarPort = [ 
  ...nodeMethodNames, 
  ...listMethodNames, 
  ...assemblyMethodNames 
] 

export function createAssemblyClass({
  name,
  memberModels = {}, 
  portMethods,
  detachableMembers = [],
  body = class {}
}) {

  // portMethods: standardize
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

  // portMethods: apply star
  portMethods = objMap(portMethods, (methodPorts, memberName) => { 
    const hasStar = !!methodPorts.find(mp => mp.method === '*')
    const mpWithoutStar = methodPorts.filter(mp => mp.method !== '*')

    if (hasStar) {
      const Member = memberModels[memberName]
      Object.getOwnPropertyNames(Member.prototype).forEach(memberMethodName => {
        if (methodNamesToIgnoreInStarPort.includes(memberMethodName)) return 
        const override = mpWithoutStar.find(mp => mp.method === memberMethodName)
        if (!override) mpWithoutStar.push({ method: memberMethodName, rename: memberMethodName})
      })
    }

    return mpWithoutStar
  })

  objForEach(portMethods, (methodPorts, memberName) => {
    methodPorts.forEach(({ method, rename }) => {
      const Member = memberModels[memberName]
      if (Member.prototype[method]) 
        body.prototype[rename] = function(...args) {
          if (!this.members[memberName]) 
            throw new Error(`${memberName} not given for ${name}`)
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