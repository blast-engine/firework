import * as u from '@blast-engine/utils'
import { createMixableClass, isMixableClass, isMixableInstance } from '@blast-engine/mixable'
import { Struct } from '../base'
import { ensure } from '../../ensure.function'

export const Assembly = createMixableClass({
  name: 'Assembly',
  inherits: [ Struct ],
  body: class {

    _constructor(args = {}) {
      this.members = args.members || args.memberInstances

      this._checkMembers()
      this._portMembers()
    }

    _portMembers() {
      u.k(this.members).forEach(name => {
        if (!this[name]) this[name] = function() {
          return this.members[name]
        }
      })
    }

    _checkMembers() {
      const assemblyName = this._class().name
      const memberClasses = this._class().members()
      const detachableMembers = this._class().detachableMembers()
      const memberInstances = this.members

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
      return this.members
    }

    has(memberName) {
      this._ensure(
        'has() is given name of detachable member', 
        () => this._class().detachableMembers().includes(memberName)
      )

      return this.members[memberName] !== null
    }

    isLoaded() {
      return u.k(this.members)
        .every(name => {
          const detachableMembers = this._class().detachableMembers()
          
          if (this.members[name] === undefined) 
            return false

          if (
            detachableMembers.includes(name) && 
            this.members[name] === null
          ) return true
          
          if (this.members[name].is(Struct)) {
            return this.members[name].isLoaded()
          } else return true
        })
    }

  }
})