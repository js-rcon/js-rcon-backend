const fs = require('fs')

// Load environment variables first
require('dotenv').config()

// Listen port
global.port = process.env.LISTEN_PORT || 8080

// CLI options passed to the script, minus 'node index.js'
global.cliOptions = process.argv.slice(2)

// Determine if running in debug mode
global.devMode = global.cliOptions.includes('-d') || global.cliOptions.includes('--debug') || false

// Determine if HTTPS is enabled
global.httpsEnabled = JSON.parse(process.env.ENABLE_HTTPS)

if (global.httpsEnabled) {
  const getSslOptions = () => {
    if (JSON.parse(process.env.SSL_USE_PFX)) {
      return {
        pfx: fs.readFileSync(process.env.SSL_PFX_FILE),
        passphrase: process.env.SSL_PFX_PASSPHRASE
      }
    } else {
      return {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
      }
    }
  }

  global.sslOptions = getSslOptions()
}

// Winston logger
const log = require('./logger')
global.log = log

// RCON error handler
global.rconerror = (filename, err) => {
  const file = filename.split(require('path').sep)[filename.split(require('path').sep).length - 1]
  log.error(`An error occurred when sending RCON command from ${file}:`, err)
}

// WebSocket error handler
global.socketerror = (filename, websocket, err) => {
  const file = filename.split(require('path').sep)[filename.split(require('path').sep).length - 1]
  log.error(`An error occurred when sending RCON command from ${file}:`, err)
  websocket.send(JSON.stringify({
    op: 'ERROR',
    c: err,
    id: 'error'
  }))
}
