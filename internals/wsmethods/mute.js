module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_mute ${msg.user}`).then(response => {
    if (response.includes(`Muted ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'MUTE_REPLY',
        c: true,
        id: msg.id
      })).catch(err => global.wserror(__filename, err))
    } else {
      websocket.send(JSON.stringify({
        op: 'MUTE_REPLY',
        c: false,
        id: msg.id
      })).catch(err => global.wserror(__filename, err))
    }
  }).catch(err => global.rconerror(__filename, err))
}
