const utils = {
  sanitizeArgs: (args) => {
    if (args.exchange) args.exchange = args.exchange.toLowerCase()
    if (args.fsym) args.fsym = args.fsym.toUpperCase()
    if (args.tsym) args.tsym = args.tsym.toUpperCase()

    return args
  }
}

module.exports = utils
