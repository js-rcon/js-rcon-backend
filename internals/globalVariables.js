// CLI options passed to the script, minus 'node index.js'
global.cliOptions = process.argv.slice(2)

// Determine if running in debug mode
global.devMode = global.cliOptions.includes('-d') || global.cliOptions.includes('--debug') || false

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
