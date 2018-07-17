module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_beacon ${msg.user}`).then(response => {
    if (response.includes(`toggled beacon on ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'BEACON_REPLY',
        c: `Toggled beacon on ${msg.user}.`,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'BEACON_REPLY',
        c: `Failed to toggle beacon on ${msg.user}!`,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
