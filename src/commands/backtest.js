const chalk = require('chalk')
const yaml = require('js-yaml')
const pad = require('pad-left')
const {validateExchange, validatePair} = require('../validators')
const {startSpinner, info, success, error} = require('../ui')
const {sanitizeArgs} = require('../utils')
const {getBackPriceRawData, extractBackPriceFromRaw} = require('../model')
const {decide} = require('../indicators')
const logger = require('../logger')()

module.exports = async (vorpal, args) => {
  if (args.options.yaml) {
    global.silent = true
  }
  let output = {}
  args = sanitizeArgs(args)
  // await validateExchange(args.exchange)
  // await validatePair(args.exchange, args.fsym, args.tsym)

  const spinner = startSpinner('Loading data...')
  const rawData = await getBackPriceRawData('data', args.exchange, args.fsym, args.tsym)
  const backPrices = await extractBackPriceFromRaw(rawData)
  spinner.stop()
  output.days = rawData.length
  logger.log(info(`Back testing against ${output.days} days...`))

  if (!args.options.interval) args.options.interval = 15

  const dataPoints = backPrices.filter((element, index) => index % args.options.interval === 0)
  output.interval = args.options.interval
  output.dataPointsLength = dataPoints.length
  logger.log(info(`...with interval of ${output.interval} minutes it's ${output.dataPointsLength} data points...`))
  logger.log()

  const result = decide(dataPoints, args.options)

  // Calculate the gain/loss
  let fromBalance = parseFloat(args.options['from-start-balance'])
  let toBalance = parseFloat(args.options['to-start-balance'])
  output.startBalance = {}
  output.startBalance[args.fsym] = fromBalance
  output.startBalance[args.tsym] = toBalance

  result.map((item, i) => {
    if (item == 'BUY') {
      const amount = fromBalance * dataPoints[i].close
      toBalance += amount
      fromBalance -= amount / dataPoints[i].close
      logger.log(success(`BUY  ${pad(amount.toFixed(2), 10)} ${chalk.bold('@')} ${pad(dataPoints[i].close, 8)}`
        + ` | Balance: ${fromBalance.toFixed(2)}${chalk.bold(args.fsym)} ${toBalance.toFixed(2)}${chalk.bold(args.tsym)}`))
    } else if (item == 'SELL') {
      const amount = toBalance / dataPoints[i].close
      const toAmount = amount * dataPoints[i].close
      toBalance -= toAmount
      fromBalance += amount
      logger.log(error(`SELL ${pad(amount.toFixed(2), 10)} ${chalk.bold('@')} ${pad(dataPoints[i].close, 8)}`
        + ` | Balance: ${fromBalance.toFixed(2)}${chalk.bold(args.fsym)} ${toBalance.toFixed(2)}${chalk.bold(args.tsym)}`))
    }
  })

  if (toBalance > fromBalance) {
    const close = dataPoints[dataPoints.length - 1].close
    const amount = toBalance / close
    fromBalance += amount
    toBalance -= amount * close
  }

  output.finalBalance = {}
  output.finalBalance[args.fsym] = fromBalance
  output.finalBalance[args.tsym] = toBalance

  logger.log()
  logger.log(info('Final balance:'))
  logger.log(` ${args.fsym}: ${fromBalance}`)
  logger.log(` ${args.tsym}: ${toBalance}`)
  logger.log()

  const diff = fromBalance - output.startBalance[args.fsym];
  const diffPercent = diff / output.startBalance[args.fsym] * 100
  if (diff > 0) {
    logger.log(success(`Gain: +${diff} (${diffPercent}%)`))
  } else {
    logger.log(error(`Loss: ${diff} (${diffPercent}%)`))
  }

  if (args.options.yaml) {
    yaml.safeDump(output)
  }
}
