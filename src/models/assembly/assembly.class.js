import * as u from '@blast-engine/utils'
import { createMixableClass, isMixableClass, isMixableInstance } from '@blast-engine/mixable'
import { LoadableModel, isLoadableModel } from '../base'
import { ensure } from '../../ensure.function'

export const Assembly = createMixableClass({
  name: 'Assembly',
  inherits: [ LoadableModel ],
  body: class {

    _constructor(args = {}) {
      this._members = args.members || args.memberInstances
      this._checkMembers()
      this._portMembers()
    }

    _portMembers() {
      u.k(this._members).forEach(name => {
        if (!this[name]) this[name] = function() {
          return this._members[name]
        }
      })
    }

    _checkMembers() {
      const assemblyName = this.class().name
      const memberClasses = this.class().members()
      const detachableMembers = this.class().detachableMembers()
      const memberInstances = this._members

      if (!memberInstances || !memberInstances === 'object') return false

      return u.k(memberClasses).every(name => {
        let isCorrectInstance
        let error

        try {

          const i = memberInstances[name]
          if (detachableMembers.includes(name) && i === null) return true
          isCorrectInstance = i && isMixableInstance(i) && i.is(memberClasses[name])

        } catch (e) { error = e }

        if (!isCorrectInstance) {
          const i = memberInstances[name]

          let givenType
          if (i === undefined) givenType = 'undefined'
          else if (i === null) givenType = 'null'
          else givenType = i._class().name

          console.error('members are given matching instances.', {
            assembly: assemblyName,
            memberName: name,
            memberClass: memberClasses[name],
            givenType,
            error,
            memberClasses,
            memberInstances
          })

        }

        return isCorrectInstance
      })
    }

    members() {
      return this._members
    }

    has(memberName) {
      this._ensure(
        'has() is given name of detachable member', 
        () => this.class().detachableMembers().includes(memberName)
      )

      return this._members[memberName] !== null
    }

    isLoaded() {
      return u.k(this._members)
        .every(name => {
          const detachableMembers = this.class().detachableMembers()
          
          if (this._members[name] === undefined) 
            return false

          if (
            detachableMembers.includes(name) && 
            this._members[name] === null
          ) return true
          
          if (isLoadableModel(this._members[name])) {
            return this._members[name].isLoaded()
          } else return true
        })
    }

  }
})