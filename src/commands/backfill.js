const _ = require('lodash')
const fs = require('fs-extra')
const moment = require('moment')
const path = require('path')

const {validateExchange, validatePair} = require('../validators')
const {startSpinner, info} = require('../ui')
const {sanitizeArgs} = require('../utils')
const {getHistoricalPrice} = require('../model')

async function fillDay (exchange, fsym, tsym, timeStart) {
  const data = await getHistoricalPrice(
    exchange,
    fsym,
    tsym,
    timeStart.toDate(),
    24 * 60
  )

  const filename = path.join(
    'data',
    exchange,
    `${fsym}-${tsym}`,
    timeStart.format('YYYY'),
    timeStart.format('MMM'),
    `${timeStart.format('DD') - 1}.csv`
  )
  fs.ensureDirSync(path.dirname(filename))
  fs.writeFileSync(filename, `time,timestamp,open,close,high,low,volumefrom,volumeto\n`)

  for (let row of data.slice(0, -1)) {
    fs.appendFileSync(filename, [
      moment.unix(row.time).format(),
      row.time,
      row.open,
      row.close,
      row.high,
      row.low,
      row.volumefrom,
      row.volumeto
    ].join(',') + `\n`)
  }
}

module.exports = async (vorpal, args) => {
  args = sanitizeArgs(args)
  await validateExchange(args.exchange)
  await validatePair(args.exchange, args.fsym, args.tsym)

  if (!_.isNumber(args.options.days) && typeof args.options.days !== 'undefined') {
    throw new Error(`"${args.days}" is invalid number of days.`)
  }

  if (typeof args.options.days === 'undefined') {
    args.options.days = 6
  } else if (args.options.days > 6) {
    throw new Error(`You can only fetch 6 days back.`)
  }

  vorpal.log(info(`Back filling ${args.options.days} days...\n`))

  let timeStart = moment().subtract(args.options.days - 1, 'days')
  timeStart.hour(0).minute(0).second(0).millisecond(0)
  const spinner = startSpinner('Loading data...')

  try {
    for (let i = args.options.days; i > 0; i--) {
      spinner.info(`  Filling ${timeStart.format('YYYY MMM DD')}`).start()
      await fillDay(args.exchange, args.fsym, args.tsym, timeStart)
      timeStart.add(1, 'day')
    }
  } catch (e) {
    spinner.stop()
    throw e
  } finally {
    spinner.stop()
  }
}
