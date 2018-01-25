const technicalIndicators = require('technicalindicators')
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

    const applyIndicator = (indicator, additionalInput, buyCallback, sellCallback) => {
      // Default arguments
      if (!additionalInput) additionalInput = {}
      if (!buyCallback) buyCallback = val => val >= 0
      if (!sellCallback) sellCallback = val => val < 0

      accumulator = indicators._accumulator()
      // TODO: validate params
      let inputString = Object.keys(additionalInput)
        .filter(param => !['values', 'SimpleMAOscillator', 'SimpleMASignal'].includes(param))
        .map(param => `${param}: ${additionalInput[param]}`)
        .join(', ')
      logger.log(info(`Applying ${indicator}... ${inputString}`))

      let indicatorInput = Object.assign(additionalInput, input)
      let indicatorResults = technicalIndicators[indicator].calculate(indicatorInput)
      indicatorResults = indicators._fillLeft(indicatorResults, close).map((val, idx) => {
        return indicators._buySellOrHold(
          accumulator,
          val && buyCallback(val, idx),
          val && sellCallback(val, idx)
        )
      })
      results.push(indicatorResults)
    }

    if (options['adl']) {
      applyIndicator(
        'ADL'
      )
    }

    if (options['adx-period']) {
      applyIndicator(
        'ADX',
        {period: options['adx-period']},
        val => val['mdi'] >= val['pdi'],
        val => val['mdi'] < val['pdi']
      )
    }

    if (options['atr-period']) {
      applyIndicator(
        'ATR',
        {period: options['atr-period']},
        (val, idx) => val >= close[idx],
        (val, idx) => val < close[idx]
      )
    }

    if (options['bb-period']) {
      applyIndicator(
        'BollingerBands',
        {
          period: options['bb-period'],
          stdDev: options['bb-stddev'],
          values: close
        },
        (val, idx) => val.upper > close[idx],
        (val, idx) => val.lower < close[idx]
      )
    }

    if (options['cci-period']) {
      applyIndicator(
        'CCI',
        {period: options['cci-period']},
        val => val >= 100,
        val => val < -100
      )
    }

    if (options['fi-period']) {
      applyIndicator(
        'ForceIndex',
        {period: options['fi-period']}
      )
    }

    if (options['fi-period']) {
      applyIndicator(
        'ForceIndex',
        {period: options['fi-period']}
      )
    }

    if (options['kst-period']) {
      applyIndicator(
        'KST',
        {
          signalPeriod: options['kst-period'],
          ROCPer1: options['kst-rocper1'],
          ROCPer2: options['kst-rocper2'],
          ROCPer3: options['kst-rocper3'],
          ROCPer4: options['kst-rocper4'],
          SMAROCPer1: options['kst-smrocper1'],
          SMAROCPer2: options['kst-smrocper2'],
          SMAROCPer3: options['kst-smrocper3'],
          SMAROCPer4: options['kst-smrocper4'],
          values: close,
        }
      )
    }

    if (options['macd-fast-period']) {
      applyIndicator(
        'MACD',
        {
          fastPeriod: options['macd-fast-period'],
          slowPeriod: options['macd-slow-period'],
          signalPeriod: options['macd-signal-period'],
          values: close,
          SimpleMAOscillator: false,
          SimpleMASignal: false
        }
      )
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
