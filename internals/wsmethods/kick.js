module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) websocket.close()
  RCONConnection.command(`sm_kick ${msg.user} ${msg.reason ? msg.reason : 'unspecified reason'}`).then((response) => {
    if (response.includes(`Kicked ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'KICK_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'KICK_REPLY',
        c: false,
        id: msg.id
      }))
    }
  })
}
