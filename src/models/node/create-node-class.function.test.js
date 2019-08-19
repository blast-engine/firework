import { isMixableInstance } from '@smackchat/mixable'
import { Ref, Struct } from '../base'
import { createNodeClass } from './create-node-class.function'

describe('NodeClass', () => {

  it('instantiates', () => {
    const TestClass = createNodeClass({
      name: 'Test',
      ref: class {
        testUpdate() {
          return this._update({
            prop1: 'prop1'
          })
        }
      },
      struct: class {

      },
      full: class {
        testMethod() {
          return 'string'
        }
      }
    })

    const test = new TestClass({
      path: ['test', 'path'],
      data: { prop1: 'data' }
    })

    ;[
      isMixableInstance(test),
      test.is(Ref, Struct)
    ].forEach(assertion => expect(assertion).toBeTruthy())
  
  })

})