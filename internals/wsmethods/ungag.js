module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_ungag ${msg.user}`).then(response => {
    if (response.includes(`Ungagged ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'UNGAG_REPLY',
        c: true,
        id: msg.id
      })).catch(err => global.wserror(__filename, err))
    } else {
      websocket.send(JSON.stringify({
        op: 'UNGAG_REPLY',
        c: false,
        id: msg.id
      })).catch(err => global.wserror(__filename, err))
    }
  }).catch(err => global.rconerror(__filename, err))
}
