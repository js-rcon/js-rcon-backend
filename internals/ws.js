const path = require('path')
const { getSession } = require('./session')
const WSMethods = require(path.join(__dirname, '/wsmethods/index'))(path.join(__dirname, '/wsmethods/'))
const heartbeat = require('./heartbeat')

function init (httpServer) {
  const WSS = require('socket.io')(httpServer)

  const RCONConnection = require('srcds-rcon')({
    address: process.env.RCON_ADDRESS,
    password: process.env.RCON_PASSWORD
  })

  RCONConnection.connect().then(() => {
    global.log.info(`Successfully connected to RCON server at ${process.env.RCON_ADDRESS}.`)

    // Authentication
    require('socketio-auth')(WSS, {
      authenticate: auth,
      postAuthenticate: postAuth,
      disconnect: disconnect,
      timeout: 1500 // Keep socket dangling for a max of 1,5 seconds before dropping the connection
    })

    setInterval(() => {
      const aliveSockets = Object.keys(WSS.sockets.connected).map(socketId => WSS.sockets.connected[socketId])
      heartbeat(RCONConnection, aliveSockets)
    }, 2000)

    WSS.on('connection', (socket) => {
      global.log.debug(`Websocket connection opened.`)

      socket.on('message', (msg) => {
        try {
          msg = JSON.parse(msg)
        } catch (e) {
          global.log.error(`Could not parse socket message to JSON: ${msg}`)
        }

        if (!msg.op || !msg.id) {
          global.log.error(`Received malformed socket message: ${msg}`)
          socket.send(JSON.stringify({
            op: 'ERROR',
            c: `Malformed socket message; missing property 'op' (Received ${msg.op}) and/or 'id' (Received ${msg.id})`,
            id: 'error'
          }))
        }

        if (WSMethods[msg.op]) WSMethods[msg.op](RCONConnection, socket, msg)
        else {
          socket.send(JSON.stringify({
            op: 'ERROR',
            c: `Operation ${msg.op} not found`,
            id: 'error'
          }))
        }
      })
    })
  }).catch(err => global.log.error(`Could not connect to RCON server: ${err.message}. Please ensure your server is running and restart.`))
}

function auth (socket, data, callback) {
  const token = data.token

  getSession(token).then(validSession => {
    if (!validSession) return callback(new Error('Invalid username or session token'))
    else return callback(null, true)
  })
}

function postAuth (socket) {
  global.log.info(`Socket ID "${socket.id}" (IP ${socket.handshake.address}) logged in.`)
}

function disconnect (socket) {
  global.log.info(`Socket ID "${socket.id}" (IP ${socket.handshake.address}) disconnected.`)
}

module.exports = {
  init: init
}
