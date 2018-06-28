module.exports = () => {
  if (arguments.callee._singletonInstance) {
    return arguments.callee._singletonInstance
  }

  arguments.callee._singletonInstance = this
  this.log = function() {
    global.silent ? '' : global.vorpal.ui.log.apply(global.vorpal.ui, arguments)
  }

  return this
}
