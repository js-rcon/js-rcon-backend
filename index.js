const express = require('express')
const app = express()
const http = require('http').Server(app)
const bodyParser = require('body-parser')
const path = require('path')
const session = require('express-session')
const NedbStore = require('nedb-session-store')(session)
const sessionStore = new NedbStore({inMemoryOnly: true})
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const { checkValidityByUsername, checkValidityById } = require('./internals/users')
const log = require('./internals/logger')

require('dotenv').config()

global.log = log // Due to having so many small files, having the logger be global will reduce unnecessary repetition.

// Use local user and password authentication
passport.use(new Strategy(
  (username, password, callback) => {
    const user = checkValidityByUsername(username, password)

    if (user) return callback(null, user) // Successful authentication
    else return callback(null, false)
  })
)

passport.serializeUser((user, callback) => {
  callback(null, user.id)
})

passport.deserializeUser((id, callback) => {
  const user = checkValidityById(id)

  if (user) return callback(null, user)
  else return callback(null, false)
})

// Initialize middleware
app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  if (req.user) { // A user is already logged in
    res.sendFile(path.join(__dirname, '/public/index.html'))
  } else { // No active login, redirect
    res.sendFile(path.join(__dirname, '/public/login.html'))
  }
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/login.html'))
})

app.post('/login',
  // TODO: Add a proper return code for authentication failure
  passport.authenticate('local', { failureRedirect: '/failed' }), // Yes, /failed isn't a route.
  (req, res) => {
    log.info(`User "${req.user.username}" logged in.`)
    res.redirect('/')
  })

http.listen(process.env.LISTEN_PORT, () => {
  log.info(`RCON web interface started on port ${process.env.LISTEN_PORT}.`)
  require('./internals/ws').init(http, sessionStore) // Pass http and sessionStore so websocket server middleware can piggyback
})
