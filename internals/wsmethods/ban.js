module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) websocket.close()
  RCONConnection.command(`sm_ban ${msg.user} ${msg.time ? msg.time : '0'} ${msg.reason ? msg.reason : 'unspecified reason'}`).then((response) => {
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
