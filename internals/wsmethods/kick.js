module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_kick ${msg.user} ${msg.reason ? msg.reason : 'No reason specified'}`).then(response => {
    if (response.includes(`Kicked ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'KICK_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'KICK_REPLY',
        c: false,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
