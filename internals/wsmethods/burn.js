module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.time) websocket.close()
  RCONConnection.command(`sm_burn ${msg.user} ${msg.time}`).then((response) => {
    if (response.includes(`Set ${msg.user} on fire`)) {
      websocket.send(JSON.stringify({
        op: 'BURN_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'BURN_REPLY',
        c: false,
        id: msg.id
      }))
    }
  })
}
