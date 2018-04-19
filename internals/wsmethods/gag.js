module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) websocket.close()
  RCONConnection.command(`sm_gag ${msg.user}`).then((response) => {
    if (response.includes(`Gagged ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'GAG_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'GAG_REPLY',
        c: false,
        id: msg.id
      }))
    }
  })
}
