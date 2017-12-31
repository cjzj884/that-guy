const utils = {
  sanitizeArgs: (args) => {
    if (args.exchange) args.exchange = args.exchange.toLowerCase()
    if (args.fsym) args.fsym = args.fsym.toUpperCase()
    if (args.tsym) args.tsym = args.tsym.toUpperCase()
    if (args.options && args.options.days) args.options.days = parseInt(args.options.days)

    return args
  }
}

module.exports = utils
