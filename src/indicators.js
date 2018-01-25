const {ADL, ADX} = require('technicalindicators')
const _ = require('lodash')

const indicators = {
  decide: (data, options) => {
    const close = data.map(point => point.close)
    const high = data.map(point => point.high)
    const low = data.map(point => point.low)
    const volume = data.map(point => point.volumefrom)
    const input = {close, high, low, volume}

    let accumulator
    let results = []

    switch (true) {
      case options.adl:
        accumulator = indicators._accumulator()
        results.push(
          ADL.calculate(input).map(val => {
            return indicators._buySellOrHold(
              accumulator,
              val >=0,
              val < 0
            )
          })
        )

      case options['adx-period']:
        accumulator = indicators._accumulator()
        let adxInput = input
        adxInput.period = options['adx-period']
        let adxResults =
          ADX.calculate(adxInput).map(val => {
            return indicators._buySellOrHold(
              accumulator,
              val['mdi'] >= val['pdi'],
              val['mdi'] < val['pdi']
            )
          })
        // Fill missing data in the beginning
        const filler = _.times(close.length - adxResults.length, _.constant(''))
        results.push(filler.concat(adxResults))

      default:

    }
    return indicators._reduceResults(results)
  },

  _buySellOrHold: (accumulator, buyCondition, sellCondition) => {
    if (buyCondition && accumulator.value != 'BUY') return accumulator.value = 'BUY'
    else if (sellCondition && accumulator.value != 'SELL') return accumulator.value = 'SELL'
  },

  _reduceResults: results => {
    let accumulator = indicators._accumulator();

    return _.unzip(results).map(choices => {
      const buys = choices.filter(val => val === 'BUY')
      const sells = choices.filter(val => val === 'SELL')

      const result = indicators._buySellOrHold(
        accumulator,
        buys.length > sells.length,
        sells.length > buys.length,
      )

      return result
    })
  },

  _accumulator: () => {
    return {
      value: undefined
    }
  }
}

module.exports = indicators
