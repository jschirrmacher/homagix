export default {
  log: [],

  debug: function (msg) {
    this.log.push(['debug', msg])
  },
  info: function (msg) {
    this.log.push(['info', msg])
  },
  warn: function (msg) {
    this.log.push(['warn', msg])
  },
  error: function (msg) {
    this.log.push(['error', msg])
  },

  reset: function () {
    this.log.length = 0
  },
}
