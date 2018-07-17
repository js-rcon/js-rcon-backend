module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_kick ${msg.user} ${msg.reason ? msg.reason : 'No reason specified'}`).then(response => {
    if (response.includes(`Kicked ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'AUTOKICK_RESPONSE',
        c: `Auto-kicked ${msg.user} for profile being new or private.`,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'AUTOKICK_RESPONSE',
        c: `Auto-kicked ${msg.user} for profile being new or private.`,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
