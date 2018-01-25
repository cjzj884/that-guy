const {ADL, ADX, ATR, BollingerBands, CCI} = require('technicalindicators')
const _ = require('lodash')
const logger = require('./logger')()
const {info} = require('./ui')

const indicators = {
  decide: (data, options) => {
    const close = data.map(point => parseFloat(point.close))
    const high = data.map(point => parseFloat(point.high))
    const low = data.map(point => parseFloat(point.low))
    const volume = data.map(point => parseFloat(point.volumefrom))
    const input = {close, high, low, volume}

    let accumulator
    let results = []

    if (options['adl']) {
      logger.log(info('Applying ADL...'))
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
    }

    if (options['adx-period']) {
      accumulator = indicators._accumulator()
      let adxInput = input
      adxInput.period = options['adx-period']
      logger.log(info(`Applying ADX... (period: ${adxInput.period})`))
      let adxResults =
        ADX.calculate(adxInput).map(val => {
          return indicators._buySellOrHold(
            accumulator,
            val['mdi'] >= val['pdi'],
            val['mdi'] < val['pdi']
          )
        })
      results.push(indicators._fillLeft(adxResults, close))
    }

    if (options['atr-period']) {
      accumulator = indicators._accumulator()
      let atrInput = input
      atrInput.period = options['atr-period']
      logger.log(info(`Applying ATR... (period: ${atrInput.period})`))
      let atrResults = ATR.calculate(atrInput)
      atrResults = indicators._fillLeft(atrResults, close).map((val, idx) => {
        return indicators._buySellOrHold(
          accumulator,
          val && val >= close[idx],
          val && val < close[idx]
        )
      })
      results.push(atrResults)
    }

    if (options['bb-period']) {
      accumulator = indicators._accumulator()
      let bbInput = {
        period: options['bb-period'],
        stdDev: options['bb-stddev'],
        values: close
      }
      logger.log(info(`Applying BB... (period: ${bbInput.period}, stddev: ${bbInput.stdDev})`))
      let bbResults = BollingerBands.calculate(bbInput)
      bbResults = indicators._fillLeft(bbResults, close).map((val, idx) => {
        return indicators._buySellOrHold(
          accumulator,
          val && val.upper > close[idx],
          val && val.lower < close[idx]
        )
      })
      results.push(bbResults)
    }

    if (options['cci-period']) {
      accumulator = indicators._accumulator()
      let cciInput = input
      cciInput.period = options['cci-period']
      logger.log(info(`Applying CCI... (period: ${cciInput.period})`))
      let cciResults = CCI.calculate(cciInput)
      cciResults = indicators._fillLeft(cciResults, close).map((val, idx) => {
        return indicators._buySellOrHold(
          accumulator,
          val >= 100,
          val < -100
        )
      })
      results.push(cciResults)
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
  },

  _fillLeft: (shorter, longer) => {
    // Fill missing data in the beginning
    const filler = _.times(longer.length - shorter.length, _.constant(''))
    return filler.concat(shorter)
  }
}

module.exports = indicators
