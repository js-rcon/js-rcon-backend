module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_kick ${msg.user} ${msg.reason ? msg.reason : 'No reason specified'}`).then(response => {
    if (response.includes(`Kicked ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'AUTOKICK_RESPONSE',
        c: `Auto-protect kicked user "${msg.user}"`,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'AUTOKICK_RESPONSE',
        c: `Auto-protect failed to kick user "${msg.user}"`,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
