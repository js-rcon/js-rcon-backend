module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.time) websocket.close()
  RCONConnection.command(`sm_burn ${msg.user} ${msg.time}`).then(response => {
    if (response.includes(`Set ${msg.user} on fire`)) {
      websocket.send(JSON.stringify({
        op: 'BURN_REPLY',
        c: true,
        id: msg.id
      })).catch(err => global.wserror(__filename, err))
    } else {
      websocket.send(JSON.stringify({
        op: 'BURN_REPLY',
        c: false,
        id: msg.id
      })).catch(err => global.wserror(__filename, err))
    }
  }).catch(err => global.rconerror(__filename, err))
}
