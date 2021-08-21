import * as u from '@blast-engine/utils'
import { createMixableClass } from '@blast-engine/mixable'
import { NodeRef } from './node-ref.class'
import { Node } from './node-full.class'

// @todo: get rid of node-ref.class.js and other files like that, leave only this funciton
//        problem: order of inheritance, example: override isLoaded in struct gets 
//        overridden back to original struct version because full node inherits from original struct as well

export const createNodeClass = ({
  name = '',
  inherits = [],
  simpleAccess = [],
  ref = class {},
  full = class {}
}) => {

  const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1)

  simpleAccess.forEach(config => {
    let path = 'DELETE_ME'
    let names = []

    if (u.isStr(config)) {
      path = config
      names = [ config ]
    } else {
      path = config.path
      if (u.isStr(config.name)) names = [ config.name ]
      else if (u.isArr(config.names)) names = config.names
    }

    const getter = function() { return this.get(path) }
    const setter = function(value) { return this.set(path, value) }

    names.forEach(name => {
      const getterName = name
      const setterName = `set${capitalizeFirstLetter(name)}`

      ref.prototype[setterName] = setter
      full.prototype[getterName] = getter
      full.prototype[setterName] = setter
    })
  })

  const NodeClassRef = createMixableClass({
    name: `${name}_ref`,
    inherits: inherits.map(Model => Model.ref()).concat([ NodeRef ]),
    staticProps: { full: () => NodeClassFull },
    body: ref
  })

  const NodeClassFull = createMixableClass({
    name: `${name}_full`,
    // @todo: if we put Node last here, then overridden isLoaded gets brought back to original
    inherits: inherits.concat([ Node, NodeClassRef ]),
    staticProps: { 
      full: () => NodeClassFull, 
      ref: () => NodeClassRef
    },
    body: full
  })

  return NodeClassFull

}