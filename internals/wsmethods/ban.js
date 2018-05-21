module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_ban ${msg.user} ${msg.time ? msg.time : '0'} ${msg.reason ? msg.reason : 'No reason'}`).then((response) => {
    if (response.includes(`banned ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'BAN_REPLY',
        c: true,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'BAN_REPLY',
        c: false,
        id: msg.id
      }))
    }
  })
}
