module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_slap ${msg.user} ${msg.damage ? msg.damage : '5'}`).then(response => {
    if (response.includes(`Slapped ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'SLAP_RESPONSE',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'SLAP_RESPONSE',
        c: false,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
