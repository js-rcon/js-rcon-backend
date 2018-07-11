module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_gag ${msg.user}`).then(response => {
    if (response.includes(`Gagged ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'GAG_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'GAG_REPLY',
        c: false,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
