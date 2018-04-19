module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) websocket.close()
  RCONConnection.command(`sm_mute ${msg.user}`).then((response) => {
    if (response.includes(`Muted ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'MUTE_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'MUTE_REPLY',
        c: false,
        id: msg.id
      }))
    }
  })
}
