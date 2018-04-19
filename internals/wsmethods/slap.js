module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user || !msg.damage) websocket.close()
  RCONConnection.command(`sm_slap ${msg.user} ${msg.damage}`).then((response) => {
    if (response.includes(`Slapped ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'SLAP_RESPONSE',
        c: true,
        id: 21
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'SLAP_RESPONSE',
        c: false,
        id: 21
      }))
    }
  })
}
