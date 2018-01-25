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
  success: chalk.green,

  Logger: vorpal => {
    if (global.silent) {
      return {
        log: () => {}
      }
    } else {
      return vorpal
    }
  }
}

module.exports = ui
