import { assert, Emitter } from '@blast-engine/utils'
import { createMixableClass } from '@blast-engine/mixable'
import { createNodeClass, createAssemblyClass, flagSymbol } from '../models'
import { FullNodeQuery, createMockCreateWatcher } from '../queries'
import { createFetcher } from '../fetchers'
import { createMockAuthEmitter } from '../firebase-services'
import { Model } from '../models'
import { Kernel } from './kernel.class'

describe('Kernel', () => {
  let kernel
  let shouldRefreshAuth
  let activeWatchers
  let createWatcher
  let authSource
  let Step1Model
  let Step2Model
  let Step3Model
  let Step4Model
  let ResultModel
  let firstStepQuery
  let secondStepQuery1
  let secondStepQuery2
  let thirdStepQuery1
  let thirdStepQuery2
  let thirdStepQuery3
  let fourthStepQuery1
  let fourthStepQuery2
  let fetcher
  let request
  let currentResult
  let currentAuth
  let resultEmissionCount
  let authEmissionCount
  let authSubId
  let result_step1_type1_loaded
  let result_step1_type2_loaded
  let result_step1_type2_not_loaded
  let result_step2_loaded
  let result_step3_type2_loaded
  let result_step4_loaded
  let result_step3_type1_loaded

  beforeAll(() => {

    const x = createMockCreateWatcher()
    activeWatchers = x.activeWatchers
    createWatcher = x.createWatcher

    authSource = createMockAuthEmitter()
    shouldRefreshAuth = new Emitter()

    const rootRef = new (createMixableClass({
      name: 'Root',
      inherits: [ Model ]
    }))()
    
    kernel = new Kernel({ 
      createWatcher,
      rootRef,
      onAuthStateChanged: (...args) => authSource.onAuthStateChanged(...args),
      fbService: {
        shouldRefreshAuth
      },
      manualFlush: true  
    })

    Step1Model = createNodeClass({
      name: 'Step1Model',
      struct: class {
        prop() {
          return this._data('prop')
        }
      }
    })

    Step2Model = createNodeClass({
      name: 'Step2Model',
    })

    Step3Model = createNodeClass({
      name: 'Step3Model',
      struct: class {
        prop() {
          return this._data('prop')
        }
      }
    })

    Step4Model = createNodeClass({
      name: 'Step4Model',
    })

    ResultModel = createAssemblyClass({
      name: 'ResultModel',
      memberModels: {
        firstStep: Step1Model,
        secondStep: Step2Model
      }
    })

    firstStepQuery = new FullNodeQuery({
      path: 'path-1',
      instantiate: data => {}
    })

    secondStepQuery1 = new FullNodeQuery({
      path: 'path-step-2_1',
      instantiate: data => {}
    })

    secondStepQuery2 = new FullNodeQuery({
      path: 'path-step-2_2',
      instantiate: data => {}
    })

    thirdStepQuery1 = new FullNodeQuery({
      path: 'path-step-3_1',
      instantiate: data => {}
    })

    thirdStepQuery2 = new FullNodeQuery({
      path: 'path-step-3_2',
      instantiate: data => {}
    })

    thirdStepQuery3 = new FullNodeQuery({
      path: 'path-step-3_2',
      instantiate: data => {}
    })

    fourthStepQuery1 = new FullNodeQuery({
      path: 'path-step-4_1',
      instantiate: data => {}
    })

    fourthStepQuery2 = new FullNodeQuery({
      path: 'path-step-4_2',
      instantiate: data => {}
    })

    fetcher = createFetcher({
      name: 'test-fetcher'
    }, args => ({
      steps: [{
        name: 'firstStep',
        query: ({ rootRef }) => { 
          if (!rootRef)
            throw new Error('missing something')
          return firstStepQuery
        }
      }, {
        name: 'secondStep',
        requires: [ 'firstStep' ],
        query: ({ firstStep, rootRef }) => {
          if (!rootRef || !firstStep)
            throw new Error('missing something')
          if (firstStep.prop() === 2) return secondStepQuery2
          else return secondStepQuery1
        }
      }, {
        name: 'thirdStep',
        requires: [ 'auth', 'firstStep' ],
        query: ({ auth, firstStep, rootRef }) => {
          if (!rootRef || !auth || !firstStep)
            throw new Error('missing something')
          if (firstStep.prop() === 2) {
            if (auth.uid() === 'user_3') return thirdStepQuery3
            else return thirdStepQuery2
          } else return thirdStepQuery1
        }
      }, {
        name: 'fourthStep',
        requires: [ 'secondStep', 'thirdStep' ],
        query: ({ secondStep, thirdStep }) => {
          if (!rootRef || !secondStep || !thirdStep)
            throw new Error('missing something')
          if (thirdStep.prop() === 2) return fourthStepQuery2
          else return fourthStepQuery1
        }
      }],
      final: {
        take: [ 'firstStep', 'secondStep', 'fourthStep' ],
        instantiate: ({ firstStep, secondStep, fourthStep, auth }) => {
          if (!firstStep || !secondStep || !fourthStep)
            throw new Error('missing something')
          return new ResultModel({ 
            members: { firstStep, secondStep, fourthStep  }
          })
        }
      }
    }))

    authSubId = kernel.subscribeToAuth(auth => {
      authEmissionCount++
      currentAuth = auth
    })

    request = kernel.createRequest(fetcher())
    request.emitter.subscribe(result => {
      resultEmissionCount++
      currentResult = result
    })

  })

  beforeEach(() => {
    authEmissionCount = 0
    resultEmissionCount = 0
  })

  // ----

  it('initializes currentResult to undefined', () => {
    assert([
      currentResult === undefined
    ])
  })

  // ----

  it(`creates a watcher for step1 during flush.
      does not create watcher for step2 because it depends on step1.`, () => {
    // await new Promise(done => { kernel.didFlush = done })
    kernel.flush()

    assert([ 
      currentResult === undefined,
      currentAuth === undefined,
      authEmissionCount === 0,
      resultEmissionCount === 0,
      activeWatchers.length === 1,
      activeWatchers[0].query.equals(firstStepQuery)
    ])
  })

  // ----

  it(`gets an auth update. updates external subscribers.`, () => {

    authSource.updateAuthState({
      uid: 'test_uid'
    })

    kernel.flush()

    assert([ 
      currentResult === undefined,
      currentAuth.uid() === 'test_uid',
      authEmissionCount === 1,
      resultEmissionCount === 0,
      activeWatchers.length === 1,
      activeWatchers[0].query.equals(firstStepQuery)
    ])
  })

  // ----

  it(`receives a result for step 1 (loaded). 
      creates watcher for step 2 during flush.
      watcher for step 3 also created since we have auth as well.`, () => {

    result_step1_type1_loaded = new Step1Model({
      path: ['some', 'path'],
      data: { 
        [flagSymbol()]: true, 
        prop: 1
      }
    }) 

    activeWatchers[0].m_updateResult(result_step1_type1_loaded)

    kernel.flush()

    assert([ 
      currentResult === undefined,
      currentAuth.uid() === 'test_uid',
      authEmissionCount === 0,
      resultEmissionCount === 0,
      activeWatchers.length === 3,
      activeWatchers[0].result === result_step1_type1_loaded,
      activeWatchers[1].query.equals(secondStepQuery1),
      activeWatchers[2].query.equals(thirdStepQuery1)
    ])
  })

  // ----

  it(`receives a different result for step 1 (loaded). 
    this result warrants a different query from step 2.
    step 2 and 3's watcher/query is updated during flush.`, () => {

    result_step1_type2_loaded = new Step1Model({
      path: ['some', 'path'],
      data: { 
        [flagSymbol()]: true, 
        prop: 2
      }
    }) 

    activeWatchers[0].m_updateResult(result_step1_type2_loaded)

    kernel.flush()

    assert([ 
      currentResult === undefined,
      currentAuth.uid() === 'test_uid',
      authEmissionCount === 0,
      resultEmissionCount === 0,
      activeWatchers.length === 3,
      activeWatchers[0].result === result_step1_type2_loaded,
      activeWatchers[1].query.equals(secondStepQuery2),
      activeWatchers[2].query.equals(thirdStepQuery2)
    ])
  })

  // ----

  it(`triggers particular step 3 query when auth updated to user_3.
    step 3 watcher created with appropriate query.`, () => {

    authSource.updateAuthState({
      uid: 'user_3'
    })

    kernel.flush()

    assert([ 
      currentResult === undefined,
      currentAuth.uid() === 'user_3',
      authEmissionCount === 1,
      resultEmissionCount === 0,
      activeWatchers.length === 3,
      activeWatchers[0].result === result_step1_type2_loaded,
      activeWatchers[1].query.equals(secondStepQuery2),
      activeWatchers[2].query.equals(thirdStepQuery3),
    ])
  })    

  // ----

  it(`auth becomes undefined.
      step 3 watcher destroyed, but step 2 is fine.`, () => {

    authSource.updateAuthState(undefined)

    kernel.flush()

    assert([ 
      currentResult === undefined,
      currentAuth === undefined,
      authEmissionCount === 1,
      resultEmissionCount === 0,
      activeWatchers.length === 2,
      activeWatchers[0].result === result_step1_type2_loaded,
      activeWatchers[1].query.equals(secondStepQuery2),
    ])
  })    

  // ----

  it(`receives a different result for step 1 (not loaded). 
    since step 1 is not loaded, step 2's
    step 2's watcher/query is removed during flush.`, () => {

    result_step1_type2_not_loaded = new Step1Model({
      path: ['some', 'path'],
      data: {  prop: 2 }
    }) 

    activeWatchers[0].m_updateResult(result_step1_type2_not_loaded)

    kernel.flush()
 
    assert([ 
      currentResult === undefined,
      currentAuth === undefined,
      authEmissionCount === 0,
      resultEmissionCount === 0,
      activeWatchers.length === 1,
      activeWatchers[0].result === result_step1_type2_not_loaded,
      activeWatchers[0].query.equals(firstStepQuery)
    ])
  })

  // ----
  
  it(`receives a different result for step 1 (loaded). 
    step 2's watcher/query is added back in (still no result for step 2).`, () => {

    activeWatchers[0].m_updateResult(result_step1_type2_loaded)

    kernel.flush()
 
    assert([ 
      currentResult === undefined,
      currentAuth === undefined,
      authEmissionCount === 0,
      resultEmissionCount === 0,
      activeWatchers.length === 2,
      activeWatchers[0].query.equals(firstStepQuery),
      activeWatchers[1].query.equals(secondStepQuery2),
      activeWatchers[1].result === undefined
    ])
  })

  // ----

  it(`receives undefined for step 1 (would happen if a hypothetical prior step were updated). 
    step 2's watcher/query is removed, since it depends on step 1`, () => {

    activeWatchers[0].m_updateResult(undefined)

    kernel.flush()
 
    assert([ 
      currentResult === undefined,
      currentAuth === undefined,
      authEmissionCount === 0,
      resultEmissionCount === 0,
      activeWatchers.length === 1,
      activeWatchers[0].query.equals(firstStepQuery)
    ])
  })

  // ----

  it(`receives a different result for step 1 (loaded). 
    step 2's watcher/query is added back in (still no result for step 2).`, () => {

    activeWatchers[0].m_updateResult(result_step1_type2_loaded)

    kernel.flush()

    assert([ 
      currentResult === undefined,
      currentAuth === undefined,
      authEmissionCount === 0,
      resultEmissionCount === 0,
      activeWatchers.length === 2,
      activeWatchers[0].query.equals(firstStepQuery),
      activeWatchers[0].result === result_step1_type2_loaded,
      activeWatchers[1].query.equals(secondStepQuery2),
      activeWatchers[1].result === undefined
    ])
  })

  // ----

  it(`receives a result for step 2 and auth (not special user)
    step 3 is requested (watcher set).`, () => {

    result_step2_loaded = new Step2Model({
      path: ['some', 'path'],
      data: { [flagSymbol()]: true }
    }) 

    activeWatchers[1].m_updateResult(result_step2_loaded)
    authSource.updateAuthState({ uid: 'xxxx' })
    
    kernel.flush()
 
    assert([ 
      currentResult === undefined,
      currentAuth.uid() === 'xxxx',
      authEmissionCount === 1,
      resultEmissionCount === 0,
      activeWatchers.length === 3,
      activeWatchers[0].query.equals(firstStepQuery),
      activeWatchers[1].query.equals(secondStepQuery2),
      activeWatchers[1].result === result_step2_loaded
    ])
  })

  // ----

  it(`receives a result for step 3.
    step 4 is requested (watcher is set).`, () => {

    result_step3_type2_loaded = new Step3Model({
      path: ['some', 'path'],
      data: { 
        [flagSymbol()]: true, 
        prop: 2
      }
    }) 

    activeWatchers[2].m_updateResult(result_step3_type2_loaded)
    authSource.updateAuthState({ uid: 'yyyy' })
    
    kernel.flush()

    assert([ 
      currentResult === undefined,
      currentAuth.uid() === 'yyyy',
      authEmissionCount === 1,
      resultEmissionCount === 0,
      activeWatchers.length === 4,
      activeWatchers[0].query.equals(firstStepQuery),
      activeWatchers[0].result,
      activeWatchers[1].query.equals(secondStepQuery2),
      activeWatchers[1].result,
      activeWatchers[2].query.equals(thirdStepQuery2),
      activeWatchers[2].result === result_step3_type2_loaded,
      activeWatchers[3].query.equals(fourthStepQuery2),
    ])
  })

  // ----

  it(`receives a result for step 4 (loaded). 
    the final result is emitted.`, () => {

    result_step4_loaded = new Step4Model({
      path: ['some', 'path'],
      data: { [flagSymbol()]: true }
    }) 

    activeWatchers[3].m_updateResult(result_step4_loaded)

    kernel.flush()

    assert([ 
      currentResult !== undefined,
      currentResult.is(ResultModel),
      currentResult.members.firstStep === activeWatchers[0].result,
      currentResult.members.secondStep === activeWatchers[1].result,
      authEmissionCount === 0,
      resultEmissionCount === 1,
      activeWatchers.length === 4,
      activeWatchers[0].query.equals(firstStepQuery),
      activeWatchers[0].result,
      activeWatchers[1].query.equals(secondStepQuery2),
      activeWatchers[1].result,
      activeWatchers[2].query.equals(thirdStepQuery2),
      activeWatchers[2].result === result_step3_type2_loaded,
      activeWatchers[3].query.equals(fourthStepQuery2),
    ])
  })

  // ----

  it(`receives a new result for step 3, once that changes step 4's query.
    result is back to undefined`, () => {

    result_step3_type1_loaded = new Step3Model({
      path: ['some', 'path'],
      data: { 
        [flagSymbol()]: true, 
        prop: 1
      }
    }) 

    activeWatchers[2].m_updateResult(result_step3_type1_loaded)
    authSource.updateAuthState({ uid: 'yyyy' })
    
    kernel.flush()

    assert([ 
      currentResult === undefined,
      authEmissionCount === 1,
      resultEmissionCount === 1,
      activeWatchers.length === 4,
      activeWatchers[0].query.equals(firstStepQuery),
      activeWatchers[0].result,
      activeWatchers[1].query.equals(secondStepQuery2),
      activeWatchers[1].result,
      activeWatchers[2].query.equals(thirdStepQuery2),
      activeWatchers[2].result === result_step3_type1_loaded,
      activeWatchers[3].query.equals(fourthStepQuery1),
    ])
  })

  // ----

  it(`can unsubscribe external listeners from auth`, () => {

    const prevAuth = currentAuth

    kernel.unsubscribeToAuth(authSubId)

    authSource.updateAuthState({ uid: 'something_else' })

    kernel.flush()

    assert([ 
      currentAuth === prevAuth,
      authEmissionCount === 0,
      resultEmissionCount === 0,
    ])
  })
})