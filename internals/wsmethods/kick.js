module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_kick ${msg.user} ${msg.reason ? msg.reason : 'No reason specified'}`).then(response => {
    if (response.includes(`Kicked ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'KICK_REPLY',
        c: `Kicked ${msg.user}${msg.reason ? ` for reason ${msg.reason}` : '.'}`,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'KICK_REPLY',
        c: `Failed to kick ${msg.user}`,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
