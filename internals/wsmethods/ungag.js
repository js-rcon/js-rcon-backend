module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_ungag ${msg.user}`).then(response => {
    if (response.includes(`Ungagged ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'UNGAG_REPLY',
        c: `Ungagged ${msg.user}.`,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'UNGAG_REPLY',
        c: `Failed to ungag ${msg.user}!`,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
