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
    global.log.info(`Successfully connected to RCON server at ${process.env.RCON_ADDRESS}.`)
    global.log.debug('Websocket connection established; ready to receive events.')
  })

  WSS.use(passportSocketIo.authorize({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser
  }))

  WSS.on('connection', (socket) => {
    if (!socket.request.user) socket.close()
    global.log.debug(`Websocket connection opened with user "${socket.request.user.username}".`)

    socket.on('message', (msg) => {
      try {
        msg = JSON.parse(msg)
      } catch (e) {
        global.log.error('Malformed message!', msg)
        socket.close()
        return
      }

      if (!msg.op || !msg.id) {
        global.log.error('Malformed message received!', msg)
        socket.close()
      }

      WSMethods[msg.op](RCONConnection, socket, msg)
    })
  })
}
