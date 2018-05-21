const path = require('path')
const cookieParser = require('cookie-parser')
const passportSocketIo = require('passport.socketio')
const passport = require('passport')
const WSMethods = require(path.join(__dirname, '/wsmethods/index'))(path.join(__dirname, '/wsmethods/'))
const heartbeat = require('./heartbeat')

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
  }).catch(err => {
    global.log.error(`Could not connect to RCON server: ${err}`)
  })

  setInterval(() => {
    let aliveSockets = Object.keys(WSS.sockets.connected).map(socketId => WSS.sockets.connected[socketId])
    heartbeat(RCONConnection, aliveSockets)
  }, 2000)

  WSS.on('connection', (socket) => {
    global.log.debug(`Websocket connection opened.`)

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
