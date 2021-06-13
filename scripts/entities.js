const u = require('@blast-engine/utils')
const { createMixableClass } = require('@blast-engine/mixable')
const { Model, createNodeClass } = require('../dist/firework')

ServerConfig = createNodeClass({
  name: 'ServerConfig',

  full: class {

    cloudServerDisabled() {
      return this._data('cloudServerDisabled')
    }

    setCloudServerDisabled(cloudServerDisabled) {
      return this._update({ cloudServerDisabled })
    }

  }

})

RootRef = createMixableClass({
  name: 'RootRef',
  inherits: [ Model ],
  body: class {
    
    serverConfigRef() {
      return this._spinoff(ServerConfig.ref(), {
        path: `serverConfig`
      })
    }

  }
})

module.exports = { ServerConfig, RootRef }
