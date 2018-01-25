module.exports = () => {
  if (global.silent) {
    return {
      log: () => {}
    }
  } else {
    return global.vorpal
  }
}
