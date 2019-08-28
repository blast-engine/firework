import { k } from '@blast-engine/utils'
import { createMixableClass, isMixableClass, isMixableInstance } from '@blast-engine/mixable'
import { Struct } from '../base'

export const Assembly = createMixableClass({
  name: 'Assembly',
  inherits: [ Struct ],
  body: class {

    _constructor(args = {}) {
      this.members = args.members || args.memberInstances
      this._ensure('members are given matching instances',
        () => {
          const memberClasses = this._class().members()
          const detachableMembers = this._class().detachableMembers()
          const memberInstances = this.members

          if (!memberInstances || !memberInstances === 'object') return false

          return k(memberClasses).every(name => {
            const i = memberInstances[name]
            if (detachableMembers.includes(name) && i === null) return true
            return isMixableInstance(i) && i.is(memberClasses[name])
          })
        }
      )
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
      return k(this.members)
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