module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_kick ${msg.user} ${msg.reason ? msg.reason : 'unspecified reason'}`).then(response => {
    if (response.includes(`Kicked ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'KICK_REPLY',
        c: true,
        id: msg.id
      })).catch(err => global.wserror(__filename, err))
    } else {
      websocket.send(JSON.stringify({
        op: 'KICK_REPLY',
        c: false,
        id: msg.id
      })).catch(err => global.wserror(__filename, err))
    }
  }).catch(err => global.rconerror(__filename, err))
}
