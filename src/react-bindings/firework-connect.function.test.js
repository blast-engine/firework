import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { BrowserRouter as Router } from 'react-router-dom'

import { assert, Emitter, keys, values, sleep } from '@smackchat/utils'
import { createFetcher } from '../fetchers'
import { MockKernel } from '../kernel'
import { nodeClassExamples, nodeDataExamples } from '../models'
import { createFireworkConnect } from './firework-connect.function'

const k = keys
const v = values

Enzyme.configure({ adapter: new Adapter() })

describe('react bindings', () => {
  let kernel
  let fireworkConnect
  let fetchBlank
  let ParentComponent
  let parentController
  let TestComponent

  // reset every time
  let renders
  let changeScarfCalls
  let changeScarfAction

  beforeAll(() => {
    kernel = new MockKernel()
    fireworkConnect = createFireworkConnect({ kernel })

    fetchBlank = createFetcher({
      name: 'blank-fetcher'
    }, () => ({
      steps: [],
      final: {
        take: [],
        instantiate: () => {}
      }
    }))

    changeScarfCalls = []
    changeScarfAction = ({ auth, arminNode }) => (scarfColor) => {
      changeScarfCalls.push({ scarfColor, arminNode, auth })
    }

    renders = []
    TestComponent = fireworkConnect(
      props => ({
        req1: fetchBlank(),
        req2: fetchBlank({ arg1: props.prop1 })
      }),
      props => ({
        prov1: {
          requires: {
            data: [ 'auth' ]
          },
          make: ({ auth }) => changeScarfAction({ auth }) 
        },
        prov2: {
          requires: {
            data: [ 'auth', 'req1' ]
          },
          make: ({ auth, req1 }) => changeScarfAction({ auth, arminNode: req1 }) 
        },
        prov3: {
          requires: { 
            props: [ 'prop2' ],
            data: [ 'req2' ]
          },
          make: ({ req2 }) => ({ req2, prop2: props.prop2 })
        }
      })
    )(class extends React.PureComponent {
      state = {
        output: 'default'
      }

      render() {
        renders.push({
          state: this.state,
          props: this.props
        })
        return <div>{this.state.output}</div>
      }
    })
  })

  parentController = new Emitter()
  ParentComponent = class extends React.PureComponent {
    state = { 
      prop1: 'prop1: starting value',
      prop2: 'prop2: starting value'
    }
    
    constructor() {
      super()
      parentController.subscribe(state => this.setState(state))
    }

    render() {
      return <TestComponent {...this.state} />
    }

  }

  beforeEach(() => {
    renders = []
  })

  it('works.', async () => {
    const mountedComponent = mount(<ParentComponent/>)

    assert([
      renders.length === 1, 
      k(renders[0].props).length === 4,
      k(renders[0].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2'
      ].includes(k)),
      k(kernel.m_requests()).length === 2
    ])

    kernel.m_updateAuth({ uid: 'some_id' })

    assert([
      renders.length === 2,
      k(renders[1].props).length === 6,
      k(renders[1].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1'
      ].includes(k)),
      renders[1].props.auth.uid() === 'some_id',
      renders[1].props.prop1 === 'prop1: starting value',
      k(kernel.m_requests()).length === 2,
      v(kernel.m_requests()).every(req => [
        fetchBlank({ arg1: 'prop1: starting value' }),
        fetchBlank()
      ].some(i => req.instructions.equals(i)))
    ])

    kernel.m_updateAuth({ uid: 'some_other_id' })

    assert([
      renders.length === 3,
      k(renders[2].props).length === 6,
      k(renders[2].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1'
      ].includes(k)),
      renders[2].props.auth.uid() === 'some_other_id',
      renders[2].props.prov1 !== renders[1].props.prov1, // <---
      k(kernel.m_requests()).length === 2,
      v(kernel.m_requests()).every(req => [
        fetchBlank({ arg1: 'prop1: starting value' }),
        fetchBlank()
      ].some(i => req.instructions.equals(i))),
    ])

    parentController.emit({ prop1: 'blah' })

    //  renders twice,
    //    once because parent prop changed (prop1).
    //      
    //    once because, after render (componentDidUpdate), 
    //      we change a subscription, which gives us the initial result (undefined in this case)
    assert([
      renders.length === 4,
      k(renders[3].props).length === 6,
      k(renders[3].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1'
      ].includes(k)),
      renders[3].props.prop1 === 'blah',
      renders[3].props.auth.uid() === 'some_other_id',
      renders[3].props.prov1 === renders[2].props.prov1, // <---
      k(kernel.m_requests()).length === 2,
      v(kernel.m_requests()).every(req => [
        fetchBlank({ arg1: 'blah' }),
        fetchBlank()
      ].some(i => req.instructions.equals(i))),
    ])

    const r0Id = kernel.m_requests()[0].id
    const armin = new nodeClassExamples.ArminNode({
      path: 'some/path',
      data: nodeDataExamples.ArminNode.loadedWithBlueScarf
    })

    kernel.m_updateRequestResult(r0Id, armin)

    assert([
      renders.length === 5,
      k(renders[4].props).length === 8,
      k(renders[4].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1',
        'prov2',
        'req1'
      ].includes(k)),
      renders[4].props.req1 === armin,
      renders[4].props.prov1 === renders[3].props.prov1,
      k(kernel.m_requests()).length === 2
    ])
    
    const armin2 = new nodeClassExamples.ArminNode({
      path: 'different/path',
      data: nodeDataExamples.ArminNode.loadedWithGrayScarf
    })

    kernel.m_updateRequestResult(r0Id, armin2)

    assert([
      renders.length === 6,
      k(renders[5].props).length === 8,
      k(renders[5].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1',
        'prov2',
        'req1'
      ].includes(k)),
      renders[5].props.req1 === armin2,
      renders[5].props.req1 !== renders[4].props.req1,
      renders[5].props.prov1 === renders[4].props.prov1,
      renders[5].props.prov2 !== renders[4].props.prov1,
      k(kernel.m_requests()).length === 2
    ])

    kernel.m_updateAuth({ uid: 'yo' })

    assert([
      renders.length === 7,
      k(renders[6].props).length === 8,
      k(renders[6].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1',
        'prov2',
        'req1'
      ].includes(k)),
      renders[6].props.req1 === armin2,
      renders[6].props.req1 === renders[5].props.req1,
      renders[6].props.prov1 !== renders[5].props.prov1,
      renders[6].props.prov2 !== renders[5].props.prov1,
      k(kernel.m_requests()).length === 2
    ])

    kernel.m_updateAuth(undefined)

    assert([
      renders.length === 8,
      k(renders[7].props).length === 5,
      k(renders[7].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'req1'
      ].includes(k)),
      renders[7].props.req1 === armin2,
      renders[7].props.req1 === renders[6].props.req1,
      k(kernel.m_requests()).length === 2
    ])

    kernel.m_updateAuth({ uid: 'yo' })
    kernel.m_updateRequestResult(r0Id, armin)
    parentController.emit({ prop2: 'blah2' })
  
    assert([
      renders.length === 11,
      k(renders[10].props).length === 8,
      k(renders[10].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1',
        'prov2',
        'req1'
      ].includes(k)),
      renders[10].props.req1 === armin,
      k(kernel.m_requests()).length === 2,
    ])

    const r1Id = kernel.m_requests()[1].id
    const santi = new nodeClassExamples.SantiNode({
      path: 'some/path',
      data: nodeDataExamples.SantiNode.loadedWith10Percent
    })

    kernel.m_updateRequestResult(r1Id, santi)

    assert([
      renders.length === 12,
      k(renders[11].props).length === 10,
      k(renders[11].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1',
        'prov2',
        'prov3',
        'req1',
        'req2'
      ].includes(k)),
      renders[11].props.req1 === armin,
      renders[11].props.req2 === santi,
      renders[11].props.prov1 === renders[10].props.prov1,
      renders[11].props.prov2 === renders[10].props.prov2,
      k(kernel.m_requests()).length === 2,
    ])

    parentController.emit({ prop2: 'blah3' })

    assert([
      renders.length === 13,
      k(renders[12].props).length === 10,
      k(renders[12].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'auth',
        'prov1',
        'prov2',
        'prov3',
        'req1',
        'req2'
      ].includes(k)),
      renders[12].props.req1 === armin,
      renders[12].props.req2 === santi,
      renders[12].props.prov1 === renders[11].props.prov1,
      renders[12].props.prov2 === renders[11].props.prov2,
      renders[12].props.prov3 !== renders[11].props.prov3,
      k(kernel.m_requests()).length === 2,
    ])

  })
})