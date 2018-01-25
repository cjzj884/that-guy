#!/usr/bin/env node
global.fetch = require('node-fetch')

const vorpal = require('vorpal')()
const {error} = require('./ui')
const {sanitizeArgs} = require('./utils')

function actionWrapper (action) {
  return async (args) => {
    return action(vorpal, args).catch(exception => {
      vorpal.log(error(exception.toString()))
    })
  }
}

function addTradingOptions (command) {
  command
    .option('-f, --from-start-balance <balance>', 'Start balance of the first symbol')
    .option('-t, --to-start-balance <balance>', 'Start balance of the second symbol')
    .option('-i, --interval <interval>', 'Specify how often (in minutes) to make decisions. Default: 15')
    .option('-o, --stop-loss <percent>', 'Loss percentage at which to sell. Default: 50')
    .option('-r, --take-profit <percent>', 'Profit percentage at which to sell. Default: 50')
    .option('-e, --exchange-fees <percent>', 'Percentage of exchange fees. Default: 0.25')

    .option('--adl', 'Use Accumulation Distribution Line (ADL)')
    .option('--adx-period <period>', 'Average Directional Index (ADX) period')
    .option('--atr-period <period>', 'Average True Range (ATR) period')
    .option('--bb-period <period>', 'Bollinger Bands (BB) period')
    .option('--bb-stddev <stddev>', 'Bollinger Bands (BB) standard deviation')
    .option('--cci-period <period>', 'Commodity Channel Index (CCI) period')
    .option('--fi-period <period>', 'Force Index (FI) period')
    .option('--kst-period <period>', 'Know Sure Thing (KST) period')
    .option('--kst-rocper1 <value>', 'Know Sure Thing (KST) rate of change 1')
    .option('--kst-rocper2 <value>', 'Know Sure Thing (KST) rate of change 2')
    .option('--kst-rocper3 <value>', 'Know Sure Thing (KST) rate of change 3')
    .option('--kst-rocper4 <value>', 'Know Sure Thing (KST) rate of change 4')
    .option('--kst-smrocper1 <value>', 'Know Sure Thing (KST) smoothed rate of change 1')
    .option('--kst-smrocper2 <value>', 'Know Sure Thing (KST) smoothed rate of change 2')
    .option('--kst-smrocper3 <value>', 'Know Sure Thing (KST) smoothed rate of change 3')
    .option('--kst-smrocper4 <value>', 'Know Sure Thing (KST) smoothed rate of change 4')
    .option('--macd-fast-period <period>', 'Moving Average Convergence Divergence (MACD) fast period')
    .option('--macd-slow-period <period>', 'Moving Average Convergence Divergence (MACD) slow period')
    .option('--macd-signal-period <period>', 'Moving Average Convergence Divergence (MACD) signal period')
    .option('--obv', 'Use On Balance Volume (OBV)')
    .option('--psar-steps <steps>', 'Parabolic Stop and Reverse (PSAR) steps')
    .option('--psar-max <max>', 'Parabolic Stop and Reverse (PSAR) max')
    .option('--roc-period <period>', 'Rate of Change (ROC) period')
    .option('--rsi-period <period>', 'Relative Strength Index (RSI) period')
    .option('--sma-short-period <period>', 'Simple Moving Average (SMA) short period')
    .option('--sma-long-period <period>', 'Simple Moving Average (SMA) long period')
    .option('--kd-period <period>', 'Stochastic Oscillator (KD) period')
    .option('--kd-signal-period <period>', 'Stochastic Oscillator (KD) signal period')
    .option('--trix-period <period>', 'Triple Exponentially Smoothed Average (TRIX) period')
    .option('--vwap', 'Use Volume Weighted Average Price (VWAP)')
    .option('--ema-short-period <period>', 'Exponential Moving Average (EMA) short period')
    .option('--ema-long-period <period>', 'Exponential Moving Average (EMA) long period')
    .option('--wma-period <period>', 'Weighted Moving Average (WMA) period')
    .option('--wema-period <period>', 'Wilder’s Smoothing (Smoothed Moving Average, WEMA) period')
    .option('--wpr-period <period>', 'WilliamsR (W%R) period')
}

vorpal
  .command('backfill <exchange> <fsym> <tsym>')
  .description('Gets history data from the exchange for the specified pair')
  .option('-d, --days <days>', 'Number of days to back fill. Default: 6')
  .action(actionWrapper(require('./commands/backfill')))

const backtestCommand = vorpal
  .command('backtest <exchange> <fsym> <tsym>')
  .description('Runs trading settings against backfilled market data')
  .option('--yaml', 'Output YAML file with results insted of human readable text')
  .action(actionWrapper(require('./commands/backtest')))
  .validate(args => {
    args = sanitizeArgs(args)
    if (!args.options['from-start-balance']) return `Start balance for ${args.fsym} missing`
    if (!args.options['to-start-balance']) return `Start balance for ${args.tsym} missing`
  })
addTradingOptions(backtestCommand)

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
