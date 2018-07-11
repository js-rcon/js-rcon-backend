module.exports = (RCONConnection, websocket, msg) => {
  return new Promise((resolve, reject) => {
    if (!msg.c) global.socketerror(__filename, websocket, `Missing property 'c'`)

    RCONConnection.command(msg.c).then(response => {
      websocket.send(JSON.stringify({
        op: 'EVAL_RESPONSE',
        c: response,
        id: msg.id
      }))
    }).catch(err => global.rconerror(__filename, err))
  })
}
