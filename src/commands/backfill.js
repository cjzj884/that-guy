const {validateExchange, validatePair} = require('../validators')
const {sanitizeArgs} = require('../utils')

module.exports = async (vorpal, args) => {
  args = sanitizeArgs(args)
  await validateExchange(args.exchange)
  await validatePair(args.exchange, args.fsym, args.tsym)
}
