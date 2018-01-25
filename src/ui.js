const chalk = require('chalk')
const ora = require('ora')

const ui = {
  startSpinner: (text) => {
    if (global.silent) {
      return {
        stop: () => {}
      }
    } else {
      return ora(text).start()
    }
  },

  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  success: chalk.green
}

module.exports = ui
