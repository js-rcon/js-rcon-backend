// This needs to be accessible by the whole application and is thus declared first
const log = require('./internals/logger')
global.log = log

const express = require('express')
const app = express()
const http = require('http').Server(app)
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const { checkCredentials } = require('./internals/users')
const { init } = require('./internals/ws')
const { pingServer, initSession, getSession, terminateSession } = require('./internals/session')
require('dotenv').config()

process.title = 'JS-RCON'

// Ping Redis server
pingServer()

// CLI options passed to the script, minus Node and file path
global.cliOptions = process.argv.slice(2)

// Determine environment
global.devMode = global.cliOptions.includes('-d') || global.cliOptions.includes('--debug') || false

// Initialize middleware
if (global.devMode) {
  log.warn('Running in debug mode - enabling CORS.')
  app.use(cors())
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(helmet({ noCache: true }))

// Serve frontend as satic assets
app.use(express.static(path.join(__dirname, '/public')))

app.get('/status', async (req, res) => {
  const session = await getSession(req.headers['token'])

  if (Object.keys(session).length === 0) { // Session is not active
    res.status(200).send({
      username: null,
      token: null
    })
  } else {
    res.status(200).send({
      username: session.id,
      token: req.headers['token'] // Returning the same token as it is valid
    })
  }
})

// Note: Only the /auth route supports username/password authentication, all others use session IDs
// This is because /auth is used for explicit login and /status is used for session validity checks

app.post('/auth', async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send({
      username: null,
      token: null,
      error: 'Missing request body parameter \'username\' or \'password\''
    })
  }

  const authed = checkCredentials(req.body.username, req.body.password)

  if (!authed) {
    log.warn(`Received invalid login for user "${req.body.username}" (IP ${req.ip}).`)

    res.status(401).send({
      username: null,
      token: null,
      error: 'Invalid username or password'
    })
  } else {
    const token = await initSession(req.body.username, req.ip)

    log.info(`User "${req.body.username}" (IP ${req.ip}) logged in.`)

    res.status(200).send({
      username: req.body.username,
      token: token, // TODO: Encrypt this before sending
      error: null
    })
  }
})

app.post('/logout', async (req, res) => {
  if (req.body.token) await terminateSession(req.body.token)
  log.info(`User "${req.body.username || '<unknown user>'}" (IP: ${req.ip}) logged out.`)
  res.status(200).send({ loggedOut: true })
})

http.listen(process.env.LISTEN_PORT || 8080, async () => {
  log.info(`RCON web interface started on port ${process.env.LISTEN_PORT || 8080}.`)
  await init(http)
})
