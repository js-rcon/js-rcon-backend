module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.time) global.socketerror(__filename, websocket, `Missing property 'time'`)

  RCONConnection.command(`sm_burn ${msg.user} ${msg.time ? msg.time : '5'}`).then(response => {
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
  }).catch(err => global.rconerror(__filename, err))
}
