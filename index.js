process.title = 'JS-RCON'

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

const router = require('./routes/router')
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

// Initialize middleware
if (global.devMode) {
  global.log.warn('Running in debug mode - enabling CORS.')
  app.use(devCors)
} else {
  app.use(prodCors)
  app.options('*', prodCors) // Respond with CORS info to OPTIONS queries
  app.enable('trust proxy')
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(helmet({ noCache: true }))

// Serve frontend as satic assets
app.use(express.static(path.join(__dirname, '/public')))

app.use('/', ratelimitConfig, router)

http.listen(process.env.LISTEN_PORT || 8080, () => {
  global.log.info(`RCON web interface started on port ${process.env.LISTEN_PORT || 8080}.`)
  init(http)
})
