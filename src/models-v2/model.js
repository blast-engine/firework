export class ModelV2 {

  constructor({ services }) {
    this._services = services
  }

  class() {
    return this.constructor
  }
  
  throwError(message, debugData) {
    const className = this.class().name
    console.error('error debug data:', debugData)
    throw new Error(`[${className}]: ${message}`)
  }

  spinoff(Model, args) {
    return new Model({ ...args, services: this._services })
  }

  _spinoff(Model, args) {
    return this.spinoff(Model, args)
  }

}