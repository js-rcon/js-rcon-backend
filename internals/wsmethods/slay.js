module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_slay ${msg.user}`).then(response => {
    if (response.includes(`Slayed ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'SLAY_RESPONSE',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'SLAY_RESPONSE',
        c: false,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
