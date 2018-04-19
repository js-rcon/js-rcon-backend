module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`say Changing map to ${msg.c}.`).then(() => {
    setTimeout(() => {
      RCONConnection.command(`map ${msg.c}`).then(() => {
        websocket.send(JSON.stringify({
          op: 'MAPCHANGE_REPLY',
          c: true,
          id: msg.id
        }))
      })
    }, 3000)
  })
}
