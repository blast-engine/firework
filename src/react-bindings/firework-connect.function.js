import React from 'react'
import { kv, kvr, k, m, shallowClone, objMap } from '@blast-engine/utils'

import { createFetcher, instructionsFromQuery } from '../fetchers'

let compIdCounter = 0

export const createFireworkConnect = ({ fwService, config }) => (
  createInstructionsMap = () => ({}), 
  createProvisioningFactory = () => ({})
) => Component => {
  let componentFireworkId = `component_${compIdCounter++}`
  return class FireworkProvider extends React.PureComponent {

    state = {
      props: {},
      instructionsMap: {},
      provisioningFactory: {},
      activeRequests: {},
      awaitingSubscription: [],
    }

    Component = Component

    _isMounted = false

    createSubscriptionHandler = (name, emitter) => result => {
      this.setState({ resultUpdated: name })
    }

    static getDerivedStateFromProps(nextProps, prevState) {
      const instructionsMap = objMap(createInstructionsMap({ 
        props: nextProps, 
        root: fwService.root, 
        rootRef: fwService.root, 
        rr: fwService.root, 
        r: fwService.root 
      }), i => {
        if (i.isQuery) return instructionsFromQuery(i)
        else return i
      })

      const provisioningFactory = createProvisioningFactory(nextProps)

      const updatedInstructions = kv(instructionsMap)
        .filter(({ k:name, v:newInst }) => {
          const oldInst = prevState.instructionsMap[name]
          return !oldInst || !oldInst.equals(newInst)
        }).map(({ k:name }) => name)

      const activeRequests = prevState.activeRequests
      updatedInstructions.forEach(name => { 
        if (activeRequests[name]) {
          // we dont support updating fetcher instructions yet
          // fwService.updateRequest(activeRequests[name].id, instructionsMap[name])
          activeRequests[name].kill()
        }
        activeRequests[name] = fwService.createRequest(instructionsMap[name])
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
            || fwService.auth()
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
            dataArgs.auth = fwService.auth()

          // @todo!: add to fwService provisioning system (like 'auth'), right now FAKING IT
          dataArgs.timeDelta = fwService.timeDelta()
          dataArgs.now = fwService.state.now

          provisions[pName] = p.make(m(propArgs, dataArgs, { fb: fwService.fbService(), fwService }))
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
      this.authSubscriberId = fwService.subscribeToAuth(authHandler)
    }

    componentWillUnmount() {
      const { activeRequests } = this.state
      k(activeRequests).forEach(name => activeRequests[name].kill())
      fwService.unsubscribeToAuth(this.authSubscriberId)
      this._isMounted = false
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

      if (fwService.auth()) 
        data.auth = fwService.auth()
      
      // @todo
      data.timeDelta = fwService.timeDelta()
      data.now = fwService.state.now

      return <Component
        fw={fwService}
        root={fwService.root}
        {...this.props}
        {...this.state.provisions}
        {...data}
      />
    }
  }    
}