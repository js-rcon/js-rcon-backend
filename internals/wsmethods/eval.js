module.exports = (RCONConnection, websocket, msg) => {
  return new Promise((resolve, reject) => {
    RCONConnection.command(msg.c).then((response) => {
      websocket.send(JSON.stringify({
        op: 'EVAL_RESPONSE',
        c: response,
        id: msg.id
      }))
    })
  })
}
