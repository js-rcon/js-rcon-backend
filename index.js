const express = require('express')
const app = express()
const http = require('http').Server(app)
const bodyParser = require('body-parser')
const cors = require('cors')
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
app.use(cors())
app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  rolling: true
}))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())

// This is redundant for now, but it will eventually be used to serve the frontend
// For now it's just future proofing
app.use(express.static(path.join(__dirname, '/public')))

app.get('/status', (req, res) => {
  if (req.user) { // A user is already logged in
    res.status(200).send({
      username: req.user.username
    })
  } else { // No active login
    res.status(200).send({
      username: null
    })
  }
})

app.post('/auth',
  passport.authenticate('local'),
  (req, res) => {
    log.info(`User "${req.user.username}" logged in.`)
    res.status(200).send({
      username: req.user.username
    })
  })

app.post('/logout', (req, res) => {
  if (!req.user) res.redirect('/') // Plain redirect for no session
  else {
    log.info(`User "${req.user.username}" logged out.`)
    req.logout()
    res.redirect('/')
  }
})

http.listen(process.env.LISTEN_PORT, () => {
  log.info(`RCON web interface started on port ${process.env.LISTEN_PORT}.`)
  require('./internals/ws').init(http, sessionStore) // Pass http and sessionStore so websocket server middleware can piggyback
})
