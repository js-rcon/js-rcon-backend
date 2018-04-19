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
const User = require('./internals/users')
const log = require('./internals/logger')

require('dotenv').config()

global.log = log // Due to having so many small files, having the logger be global will reduce unnecessary repetition.

// Use local user and password authentication
passport.use(new Strategy(
  function (username, password, cb) {
    let user = User.checkValidityByUsername(username, password)
    if (user) return cb(null, user)
    if (!user) return cb(null, false)
  }))

passport.serializeUser(function (user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function (id, cb) {
  let user = User.checkValidityById(id)
  if (user) return cb(null, user)
  if (!user) return cb(null, false)
})

// Initialize middleware
app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, store: sessionStore }))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  if (req.user) {
    res.sendFile(path.join(__dirname, '/public/index.html'))
  } else {
    res.sendFile(path.join(__dirname, '/public/login.html'))
  }
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/login.html'))
})

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/failed' }), // Yes, /failed isn't a route.
  function (req, res) {
    log.info(`${req.user.username} logged in.`)
    res.redirect('/')
  })

http.listen(process.env.LISTEN_PORT, () => {
  log.info(`Listening on port ${process.env.LISTEN_PORT}.`)
  require('./internals/ws').init(http, sessionStore) // Pass http and sessionStore so websocket server middleware can piggyback
})
