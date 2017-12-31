const chalk = require('chalk')

const {startSpinner} = require('./ui')
const {listExchanges, getPairPrice} = require('./model')

const validators = {
  validateExchange: async (exchange) => {
    const spinner = startSpinner('Loading exchanges...')
    const exchanges = await listExchanges()
    spinner.stop()

    if (exchanges.indexOf(exchange) === -1) {
      throw new Error(`Unsupported "${exchange}" exchange. ` +
        `To list supported ones use ${chalk.bold('exchanges')} command.`)
    }
  },

  validatePair: async (exchange, fsym, tsym) => {
    const spinner = startSpinner('Getting pair price...')
    try {
      await getPairPrice(exchange, fsym, tsym)
    } catch (e) {
      throw new Error(`${exchange} exchange doesn't support ${fsym}/${tsym} pair. ` +
        `To list supported ones use ${chalk.bold('pairs')} command.`)
    } finally {
      spinner.stop()
    }
  }
}

module.exports = validators
