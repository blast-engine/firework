import { isMixableInstance } from '@blast-engine/mixable'
import { Ref, Struct } from '../base'
import { createListClass } from './create-list-class.function'
import { createNodeClass } from './../node'

describe('ListClass', () => {

  const Item = createNodeClass({
    name: 'myNodeModel',
    ref: class {
      getPath() {
        return this._path()
      }
    },
    struct: class {
      getData() {
        return this._data()
      }
    },
    full: class {
      update() {
        return this._update({ data: 'data1', path: 'path1'})
      }
    }
  })

  const TestClass = createListClass({
    name: 'TestClass',
    itemModel: Item
  })
  

  it('instantiates', () => {

    const test = new TestClass({
      path: [' test '],
      data: { 
        key1: undefined,
        key2: "ee"
      }
    })
    
    ;[
      isMixableInstance(test),
      test.is(Ref, Struct),
      !test.isLoaded()
    ].forEach(assertion => expect(assertion).toBeTruthy())
  
  })

  it('do', () => {

  })

})