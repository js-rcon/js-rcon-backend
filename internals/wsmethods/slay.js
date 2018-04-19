module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) websocket.close()
  RCONConnection.command(`sm_slay ${msg.user}`).then((response) => {
    if (response.includes(`Slayed ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'SLAY_RESPONSE',
        c: true,
        id: 21
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'SLAY_RESPONSE',
        c: false,
        id: 21
      }))
    }
  })
}
