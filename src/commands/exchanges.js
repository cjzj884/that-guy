const {listExchanges} = require('../model')
const {startSpinner, info} = require('../ui')

module.exports = async (vorpal, args) => {
  const spinner = startSpinner('Loading exchanges...')
  const exchanges = await listExchanges()
  spinner.stop()

  vorpal.log(info(`Supported exchanges:\n`))
  for (let exchange of exchanges) {
    vorpal.log(`  ${exchange}`)
  }
}
