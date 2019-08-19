import React from 'react'
import { kv, kvr, k, m, shallowClone} from '@smackchat/utils'
let j = undefined
export const createFireworkConnect = ({ kernel }) => (
  createInstructionsMap = () => ({}), 
  createProvisioningFactory = () => ({})
) => Component => class extends React.PureComponent {

  state = {
    props: {},
    instructionsMap: {},
    provisioningFactory: {},
    activeRequests: {},
    awaitingSubscription: [],
  }

  _isMounted = false

  createSubscriptionHandler = (name, emitter) => result => {
    this.setState({ resultUpdated: name })
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const instructionsMap = createInstructionsMap(nextProps)
    const provisioningFactory = createProvisioningFactory(nextProps)

    const updatedInstructions = kv(instructionsMap)
      .filter(({ k:name, v:newInst }) => {
        const oldInst = prevState.instructionsMap[name]
        return !oldInst || !oldInst.equals(newInst)
      }).map(({ k:name }) => name)

    const activeRequests = prevState.activeRequests
    updatedInstructions.forEach(name => { 
      if (activeRequests[name]) activeRequests[name].kill()
      activeRequests[name] = kernel.createRequest(instructionsMap[name])
    })

    const propsUpdated = kv(nextProps)
      .filter(({ k, v }) => prevState.props[k] !== v)
      .map(({ k, v }) => k)

    const provisions = shallowClone(prevState.provisions)

    // @todo: merge/optimize these 3 loops

    // delete all provisions for which props have changed
    kv(provisioningFactory).forEach(({ k:pName, v:p }) => {
      if (
        ((p.requires || {}).props || [])
          .some(propName => propsUpdated.includes(propName))
      ) delete provisions[pName]
    })

    // delete all provisions for which data has changed (includes 'auth')
    if (prevState.resultUpdated)
    kv(provisioningFactory).forEach(({ k:pName, v:p }) => {
      if (
        ((p.requires || {}).data || [])
          .some(dName => prevState.resultUpdated === dName)
      ) delete provisions[pName]
    })

    // make all provisions that we dont current have and can make
    kv(provisioningFactory).forEach(({ k:pName, v:p }) => {

      if (
        // we dont have the provision
        !provisions[pName]
        // we have all the requirements
        && ((p.requires || {}).props || [])
          .every(propName => k(nextProps).includes(propName))
        && ((p.requires || {}).data || [])
          .filter(dName => dName !== 'auth')
          .every(dName => activeRequests[dName].result !== undefined)
        && (
          !((p.requires || {}).data || []).includes('auth')
          || kernel.auth()
        )
      ) {

        const propArgs = kvr(
          ((p.requires || {}).props || [])
            .map(propName => ({ k:propName, v:nextProps[propName] }))
        )

        const dataArgs = kvr(
          ((p.requires || {}).data || [])
            .filter(dName => dName !== 'auth')
            .map(dName => ({ k:dName, v:activeRequests[dName].result }))
        )

        if (((p.requires || {}).data || []).includes('auth'))
          dataArgs.auth = kernel.auth()

        // @todo!: add to kernel provisioning system (like 'auth'), right now FAKING IT
        dataArgs.timeDelta = kernel.timeDelta()
        dataArgs.now = kernel.state.now

        provisions[pName] = p.make(m(propArgs, dataArgs, { fb: kernel.fbService(), kernel }))
      }
    })

    return {
      resultUpdated: undefined,
      props: nextProps,
      instructionsMap,
      provisioningFactory,
      activeRequests,
      awaitingSubscription: updatedInstructions,
      provisions,
    }
  }

  componentDidUpdate() {
    this.updateSubscriptions()
  }

  componentDidMount() {
    this._isMounted = true
    this.updateSubscriptions()

    const authHandler = this.createSubscriptionHandler('auth')
    this.authSubscriberId = kernel.subscribeToAuth(authHandler)
  }

  componentWillUnmount() {
    const { activeRequests } = this.state
    k(activeRequests).forEach(name => activeRequests[name].kill())
    this.__isMounted = false
  }

  updateSubscriptions() { 
    this.state.awaitingSubscription.forEach(name => { 
      const req = this.state.activeRequests[name]
      const emitter = req.emitter
      emitter.subscribe(
        this.createSubscriptionHandler(name, emitter)
      )
    })

    // dont cause rerender
    this.state.awaitingSubscription = []
  }
  
  render() {

    const data = kv(this.state.activeRequests)
      .filter(({ v:request }) => request.result !== undefined)
      .reduce((results, { k:name, v:request }) => m(
        results, { [name]: request.result }
      ), {})

    if (kernel.auth()) 
      data.auth = kernel.auth()
    
    // @todo
    data.timeDelta = kernel.timeDelta()
    data.now = kernel.state.now

    return <Component
      fb={kernel.fbService()}
      kernel={kernel}
      {...this.props}
      {...this.state.provisions}
      {...data}
    />
  }
    
}