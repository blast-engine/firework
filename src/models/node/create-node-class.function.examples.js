import { createNodeClass } from './create-node-class.function'

export const nodeClassExamples = {

  ArminNode: createNodeClass({
    name: 'ArminNode',
    struct: class {
      scarf() {
        return this._data('scarf')
      }
    },
    ref: class {
      initialize() {
        return this._update({ scarf: 'gray', smoking: 'always' })
      }
    },
    full: class {
      changeScarf() {
        return this._update({
          scarf: this.scarf() === 'gray' ? 'blue' : 'gray'
        })
      }
    }
  }),

  SantiNode: createNodeClass({
    name: 'SantiNode',
    struct: class {
      phoneBatteryPercent() {
        return this._data('phoneBatteryPercent')
      }
      phoneIsDead() {
        return this._data('phoneBatteryPercent') === 0
      }
    },
    ref: class {
      initialize() {
        return this._update({ phoneBatteryPercent: 60 })
      }
    },
    full: class {
      playSongOnYoutube() {
        return this._update({
          phoneBatteryPercent: this.phoneBatteryPercent() - 10
        })
      }
    }
  })
  
}

export const nodeDataExamples = {
  ArminNode: {
    empty: null,
    notLoaded1: undefined,
    notLoaded2: {
      scarf: 'blue'
    },
    loadedWithBlueScarf: {
      _: true,
      scarf: 'blue'
    },
    loadedWithGrayScarf: {
      _: true,
      scarf: 'gray'
    }
  },
  SantiNode: {
    empty: null,
    notLoaded1: undefined,
    notLoaded2: {
      phoneBatteryPercent: 30
    },
    loadedWith30Percent: {
      _: true,
      phoneBatteryPercent: 30
    },
    loadedWith10Percent: {
      _: true,
      phoneBatteryPercent: 10
    }
  }
}