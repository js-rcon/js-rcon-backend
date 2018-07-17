module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_unmute ${msg.user}`).then(response => {
    if (response.includes(`Unmuted ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'UNMUTE_REPLY',
        c: `Unmuted ${msg.user}.`,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'UNMUTE_REPLY',
        c: `Failed to unmute ${msg.user}!`,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
