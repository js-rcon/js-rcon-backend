module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command(`sm_slay ${msg.user}`).then(response => {
    if (response.includes(`Slayed ${msg.user}`)) {
      websocket.send(JSON.stringify({
        op: 'SLAY_RESPONSE',
        c: true,
        id: 21
      })).catch(err => global.wserror(__filename, err))
    } else {
      websocket.send(JSON.stringify({
        op: 'SLAY_RESPONSE',
        c: false,
        id: 21
      })).catch(err => global.wserror(__filename, err))
    }
  }).catch(err => global.rconerror(__filename, err))
}
