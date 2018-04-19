const path = require('path')
const cookieParser = require('cookie-parser')
const passportSocketIo = require('passport.socketio')
const passport = require('passport')
const WSMethods = require(path.join(__dirname, '/wsmethods/index'))(path.join(__dirname, '/wsmethods/'))

let WSS
let RCONConnection = require('srcds-rcon')

exports.init = (app, sessionStore) => {
  WSS = require('socket.io')(app)

  RCONConnection = RCONConnection({
    address: process.env.RCON_ADDRESS,
    password: process.env.RCON_PASSWORD
  })

  RCONConnection.connect().then(() => {
    log.info('Connection established to RCON.') // eslint-disable-line
    log.info('Websocket is now ready to receive events.') // eslint-disable-line
  })

  WSS.use(passportSocketIo.authorize({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser
  }))

  WSS.on('connection', (socket) => {
    if (!socket.request.user) socket.close() // eslint-disable-line
    log.info(`Websocket opened with user ${socket.request.user.username}`) // eslint-disable-line
    socket.on('message', (msg) => {
      try {
        msg = JSON.parse(msg)
      } catch (e) {
        log.error('Malformed message!', msg) // eslint-disable-line
        socket.close()
        return
      }
      if (!msg.op || !msg.id) {
        log.error('Malformed message received!', msg) // eslint-disable-line
        socket.close()
      }
      WSMethods[msg.op](RCONConnection, socket, msg)
    })
  })
}
