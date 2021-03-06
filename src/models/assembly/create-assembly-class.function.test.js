import { isMixableInstance } from '@blast-engine/mixable'
import { Ref, Struct } from '../base'
import { createNodeClass } from '../node'
import { createAssemblyClass } from './create-assembly-class.function'

describe('AssemblyClass', () => {

  const Room = createNodeClass({
    name: 'room',
    ref: class {
      initialize(args){
        this.path = args.path
        this.data = args.data || null
      }
      query() {
        return { 
          type: 'oncePerChile',
          path: this.path,
          model: this._class().full()
        }
      }
    },
    struct: class {
      setData(data){
        this.data = data
      }
    },
    full: class {
      getId(){
        return this._data('id')
      }
      name(){
        return this._data('topic')
      }
    }
  })

  const User = createNodeClass({
    name: 'user',
    ref: class {
      initialize(args){
        this.path = args.path
        this.data = args.data || null
      }
      query(){
        return {
          type: 'oncePerChild',
          path: this.path,
          model: this._class().full() // abstract this out
        }
      }

    },
    struct: class {
      setData(data){
        this.data = data
      }
      uname(){
        return this._data('username')
      }
    },
    full: class {
      getId(){
        return this._data('id')
      }
    }
  })



  it('instantiates', () => {

    // roomInternal: {
    //   class: RoomInternal,
    //   portMethods: [
    //     'selectCandidateAsContender',
    //   ]
    // },
    // roomBasic: {
    //   class: RoomBasic,
    //   portMethods: [
    //     { method: 'getTopic', rename: 'getRoomTopic' }
    //   ]
    // },
    
    const RUAssembly = createAssemblyClass({
      name: 'RAssembly',
      memberModels: {
        room: Room,
        user: User
      },
      portMethods: {
        room: [
          { method: 'getId', rename: 'getRoomId'},
          'name'
        ],
        user: [
          'getId'
        ]
      }
    })

    const t = new RUAssembly({
      members: {
        room: new Room({ path: '/armin/ghobadi', data: { id: 'sampleRoomId', topic: 'sampleRoomTopic' } }),
        user: new User({ path: '/armin/ghob', data: { id: 'sampleUserId', username: 'armin' } })
      }
    })

    ;[
      isMixableInstance(t),
      // @todo: assemblies are structs because 
      //        they have "isLoaded()", but that 
      //        shouldnt make it a struct because 
      //        it doesnt have a data struct we can 
      //        just put in the database. structs 
      //        and assemblies should inherit from "loadable"
      t.is(Struct), 
      !t.isLoaded()
    ].forEach(assertion => expect(assertion).toBeTruthy())
  
  })

})