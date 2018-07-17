module.exports = (RCONConnection, websocket, msg) => {
  if (!msg.user) global.socketerror(__filename, websocket, `Missing property 'user'`)

  RCONConnection.command(`sm_ban ${msg.user} ${msg.time ? msg.time : '0'} ${msg.reason ? msg.reason : 'No reason specified'}`).then(response => {
    if (response.includes(`banned ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'BAN_REPLY',
        c: `Banned ${msg.user}${msg.reason ? ` for reason ${msg.reason}` : ''}${msg.time ? ` for ${msg.time} minutes` : ''}.`,
        id: msg.id
      }))
    } else {
      websocket.send(JSON.stringify({
        op: 'BAN_REPLY',
        c: `Failed to ban ${msg.user}!`,
        id: msg.id
      }))
    }
  }).catch(err => global.rconerror(__filename, err))
}
