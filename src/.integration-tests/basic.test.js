import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { BrowserRouter as Router } from 'react-router-dom'

import { createMixableClass } from '@smackchat/mixable'
import { assert, Emitter, keys, values, sleep } from '@smackchat/utils'
import { createFetcher } from '../fetchers'
import { Kernel } from '../kernel'
import { createCreateWatcher } from '../queries'
import { createMockGetFbRef, createMockAuthEmitter } from '../firebase-services'
import { Model } from '../models'
import { createFireworkConnect } from '../react-bindings'
import { fullNodeQueryExamples } from '../queries/full-node/full-node.query.examples'
import { nodeClassExamples, nodeDataExamples } from '../models/node/create-node-class.function.examples'

const k = keys
const v = values

Enzyme.configure({ adapter: new Adapter() })

describe('react bindings', () => {
  let fbRefs
  let updateAuthState
  let shouldRefreshAuth
  let rootRef
  let kernel
  let fireworkConnect
  let fetchEasy
  let ParentComponent
  let parentController
  let TestComponent

  // reset every time
  let renders
  let changeScarfCalls
  let changeScarfAction

  beforeAll(() => {

    // @todo: merge into "firebase service"
    const { getFbRef, fbRefs:f } = createMockGetFbRef()
    fbRefs = f

    const { onAuthStateChanged, updateAuthState:u } = createMockAuthEmitter()
    updateAuthState = u
    shouldRefreshAuth = new Emitter()

    rootRef = new (createMixableClass({
      name: 'Root',
      inherits: [ Model ]
    }))()

    kernel = new Kernel({
      createWatcher: createCreateWatcher({ getFbRef }),
      onAuthStateChanged,
      fbService: {
        shouldRefreshAuth
      },
      manualFlush: true,
      rootRef
    })

    fireworkConnect = createFireworkConnect({ kernel })

    fetchEasy = createFetcher({
      name: 'blank-fetcher'
    }, () => ({
      steps: [{
        name: 'firstStep',
        query: ({ rootRef }) => {
          return fullNodeQueryExamples.armin
        }
      }],
      final: {
        take: [ 'firstStep' ],
        instantiate: ({ firstStep }) => firstStep
      }
    }))

    renders = []
    TestComponent = fireworkConnect(
      props => ({
        easy: fetchEasy()
      })
    )(class extends React.PureComponent {
      state = {}
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
    renders; fbRefs; kernel;
    kernel.flush(0)

    assert([
      renders.length === 1,
      k(renders[0].props).length === 4,
      k(renders[0].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2'
      ].includes(k)),
      k(fbRefs).length === 1,
      k(fbRefs)[0] === fullNodeQueryExamples.armin.path()
    ])

    fbRefs[fullNodeQueryExamples.armin.path()].triggerValueEvent({ 
      val: nodeDataExamples.ArminNode.loadedWithGrayScarf
    })

    kernel.flush()

    const nc = nodeClassExamples
    const fq = fullNodeQueryExamples
    assert([
      renders.length === 2,
      k(renders[1].props).length === 5,
      k(renders[1].props).every(k => [
        'fb',
        'kernel',
        'prop1',
        'prop2',
        'easy'
      ].includes(k)),
      renders[1].props.easy.is(nc.ArminNode),
      k(fbRefs).length === 1,
      k(fbRefs)[0] === fq.armin.path()
    ])

  })
})