module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_ungag ${msg.user}`).then((response) => {
    if (response.includes(`Ungagged ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'UNGAG_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'UNGAG_REPLY',
        c: false,
        id: msg.id
      }))
    }
  })
}
