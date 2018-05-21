module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_beacon ${msg.user}`).then((response) => {
    if (response.includes(`toggled beacon on ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'BEACON_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'BEACON_REPLY',
        c: false,
        id: msg.id
      }))
    }
  })
}
