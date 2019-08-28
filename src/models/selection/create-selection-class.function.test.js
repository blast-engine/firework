import { isMixableInstance } from '@blast-engine/mixable'
import { Ref, Struct } from '../base'
import { createNodeClass } from '../node'
import { createSelectionClass } from './create-selection-class.function'

describe('SelectionClass', () => {

  it('instantiates', () => {

    const TestItem = createNodeClass({
      name: 'TestItem',
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

    const TestSelection = createSelectionClass({
      name: 'TestSelection',
      itemModel: TestItem,
    })

    const test = new TestSelection({
      path: ['test', 'path'],
      keys: [ 'child1', 'child2' ],
      data: { 
        child1: 'data' 
      }
    })

    ;[
      isMixableInstance(test),
      test.is(Ref, Struct),
      !test.isLoaded()
    ].forEach(assertion => expect(assertion).toBeTruthy())
  
  })

})