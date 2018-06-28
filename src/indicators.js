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

    if (options['obv']) {
      applyIndicator(
        'OBV'
      )
    }

    if (options['psar-steps']) {
      applyIndicator(
        'PSAR',
        {
          step: options['psar-steps'],
          max: options['psar-max']
        },
        (val, idx) => val >= close[idx],
        (val, idx) => val < close[idx]
      )
    }

    if (options['roc-period']) {
      applyIndicator(
        'ROC',
        {
          period: options['roc-period'],
          values: close
        }
      )
    }

    if (options['rsi-period']) {
      applyIndicator(
        'RSI',
        {
          period: options['rsi-period'],
          values: close
        },
        val => val <= 30,
        val => val >= 70
      )
    }

    if (options['sma-short-period']) {
      accumulator = indicators._accumulator()
      logger.log(info(`Applying SMA... shortPeriod: ${options['sma-short-period']}, longPeriod: ${options['sma-long-period']}`))

      const shortResults = technicalIndicators.SMA.calculate({
        period: options['sma-short-period'],
        values: close
      })
      const longResults = technicalIndicators.SMA.calculate({
        period: options['sma-long-period'],
        values: close
      })

      let indicatorResults = _.zip(shortResults, longResults)
        .map(results => {
          const short = results[0]
          const long = results[1]

          return indicators._buySellOrHold(
            accumulator,
            short && long && short >= long,
            short && long && short < long
          )
        })
      results.push(indicators._fillLeft(indicatorResults, close))
    }

    if (options['kd-period']) {
      applyIndicator(
        'Stochastic',
        {
          period: options['kd-period'],
          signalPeriod: options['kd-signal-period']
        },
        val => val.d >= val.k,
        val => val.d < val.k
      )
    }

    if (options['trix-period']) {
      applyIndicator(
        'TRIX',
        {
          period: options['trix-period'],
          values: close
        }
      )
    }

    if (options['vwap']) {
      applyIndicator(
        'VWAP',
        {},
        (val, idx) => val >= close[idx],
        (val, idx) => val < close[idx]
      )
    }

    if (options['ema-short-period']) {
      accumulator = indicators._accumulator()
      logger.log(info(`Applying EMA... shortPeriod: ${options['ema-short-period']}, longPeriod: ${options['ema-long-period']}`))

      const shortResults = technicalIndicators.EMA.calculate({
        period: options['ema-short-period'],
        values: close
      })
      const longResults = technicalIndicators.EMA.calculate({
        period: options['ema-long-period'],
        values: close
      })

      let indicatorResults = _.zip(shortResults, longResults)
        .map(results => {
          const short = results[0]
          const long = results[1]

          return indicators._buySellOrHold(
            accumulator,
            short && long && short >= long,
            short && long && short < long
          )
        })
      results.push(indicators._fillLeft(indicatorResults, close))
    }

    if (options['wma-period']) {
      applyIndicator(
        'WMA',
        {
          period: options['wma-period'],
          values: close
        },
        (val, idx) => val >= close[idx],
        (val, idx) => val < close[idx]
      )
    }

    if (options['wema-period']) {
      applyIndicator(
        'WEMA',
        {
          period: options['wema-period'],
          values: close
        },
        (val, idx) => val >= close[idx],
        (val, idx) => val < close[idx]
      )
    }

    if (options['wpr-period']) {
      applyIndicator(
        'WilliamsR',
        {
          period: options['wpr-period']
        },
        val => val >= 20,
        val => val < 20
      )
    }

    logger.log()

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
