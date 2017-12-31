const {validateExchange} = require('../validators')
const {listPairs} = require('../model')
const {startSpinner, info} = require('../ui')
const {sanitizeArgs} = require('../utils')

module.exports = async (vorpal, args) => {
  args = sanitizeArgs(args)
  await validateExchange(args.exchange)

  const spinner = startSpinner('Loading pairs...')
  const pairs = await listPairs(args.exchange)
  spinner.stop()

  vorpal.log(info(`Pairs supported by ${args.exchange}:\n`))
  for (let pair of pairs) {
    vorpal.log(`  ${pair.fsym}/${pair.tsym}`)
  }
}
