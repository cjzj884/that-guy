const chalk = require('chalk')
const ora = require('ora')

const ui = {
  startSpinner: (text) => ora(text).start(),

  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue
}

module.exports = ui
