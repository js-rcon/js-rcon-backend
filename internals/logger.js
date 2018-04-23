const winston = require('winston')

// Determine environment
const dev = process.env.NODE_ENV !== 'production' || !process.argv.includes('-p')

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true,
      level: dev ? 'debug' : 'info',
      humanReadableUnhandledException: true,
      json: false
    })
  ],
  exitOnError: true
})
