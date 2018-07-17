module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_mute ${msg.user}`).then(response => {
    if (response.includes(`Muted ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'MUTE_REPLY',
        c: `Muted ${msg.user}.`,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'MUTE_REPLY',
        c: `Failed to mute ${msg.user}!`,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
