const winston = require('winston')

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true,
      level: global.devMode ? 'silly' : 'info',
      humanReadableUnhandledException: true,
      json: false
    })
  ],
  exitOnError: true
})
