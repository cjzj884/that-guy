#!/usr/bin/env node
global.fetch = require('node-fetch')

const vorpal = require('vorpal')()
const {error, info} = require('./ui')

const actionWrapper = action => {
  return async (args) => {
    return action(vorpal, args).catch(exception => {
      vorpal.log(error(exception.toString()))
    })
  }
}

vorpal
  .command('backfill <exchange> <fsym> <tsym>')
  .description('Gets history data = require(the exchange for the specified pair')
  .option('-d, --days <days>', 'Number of days to back fill. Default: 6')
  .action(actionWrapper(require('./commands/backfill')))

vorpal
  .command('exchanges')
  .description('Lists all supported exchanges')
  .action(actionWrapper(require('./commands/exchanges')))

vorpal
  .command('pairs <exchange>')
  .description('Lists all pairs supported by an exchange')
  .action(actionWrapper(require('./commands/pairs')))

vorpal
  .catch()
  .action(vorpal.help)

vorpal
  .parse(process.argv)
