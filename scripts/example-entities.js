const u = require('@blast-engine/utils')
const { createMixableClass } = require('@blast-engine/mixable')
import { Model, createNodeClass } from '@/firework'

const ServerConfig = createNodeClass({
  name: 'ServerConfig',

  full: class {

    cloudServerDisabled() {
      return this.data('cloudServerDisabled')
    }

    setCloudServerDisabled(cloudServerDisabled) {
      return this._update({ cloudServerDisabled })
    }

  }

})

const RootRef = createMixableClass({
  name: 'RootRef',
  inherits: [ Model ],
  body: class {
    
    serverConfigRef() {
      return this.spinoff(ServerConfig.ref(), {
        path: `serverConfig`
      })
    }

  }
})

module.exports = { ServerConfig, RootRef }
