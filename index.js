process.title = 'JS-RCON'

// This looks horrible here but it will make sense in the flesh
console.log(
  `   ________________________________________
  |    _  ___       ___   ___  ___   _  _  |
  | _ | |/ __| ___ | _ \\ / __|/ _ \\ | \\| | |
  || || |\\__ \\|___||   /| (__| (_) || .\` | |
  | \\__/ |___/     |_|_\\ \\___|\\___/ |_|\\_| |
  |________________________________________|
`)

// Load native extensions and global variables
require('./internals/globalVariables')
require('./internals/nativeExtensions')

// Load environment variables
require('dotenv').config()

const express = require('express')
const app = express()
const http = require('http').Server(app)
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const RateLimit = require('express-rate-limit')
const ora = require('ora')

const router = require('./internals/router')
const { init } = require('./internals/ws')
const { pingServer } = require('./internals/session')

// Ping Redis
pingServer()

// In development CORS is enabled completely
const devCors = cors()

// In production only localhost and the equivalent IP are allowed
const prodCors = cors({ origin: [ `http://localhost:${process.env.LISTEN_PORT || 8080}`, `http://127.0.0.1:${process.env.LISTEN_PORT || 8080}` ] })

// Initialise rate limit config
const ratelimitConfig = new RateLimit({
  windowMs: process.env.RATELIMIT_WINDOW || 5000,
  max: process.env.BLOCK_THRESHOLD || 15,
  message: 'Too many requests, please try again later.',
  headers: true
})

const corsLog = ora('Initialising request policy...').start()

// Initialize middleware
if (global.devMode) {
  app.use(devCors)
  corsLog.warn('Running in debug mode. Unrestricted request policy enabled.')
} else {
  app.use(prodCors)
  app.options('*', prodCors) // Respond with CORS info to OPTIONS queries
  app.enable('trust proxy')
  corsLog.succeed('Running in production mode. Same-origin request policy enabled.')
}

const webLog = ora('Starting webserver...').start()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(helmet({ noCache: true }))

// Serve frontend as satic assets
app.use(express.static(path.join(__dirname, '/public')))

app.use('/', ratelimitConfig, router)

http.listen(process.env.LISTEN_PORT || 8080, () => {
  webLog.succeed(`Web interface started on http://localhost:${process.env.LISTEN_PORT || 8080}.`)
  init(http)
})
