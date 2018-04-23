const parseColumns = require('parse-columns')

module.exports = (RCONConnection, websocket, msg) => {
  return new Promise((resolve, reject) => {
    RCONConnection.command('sm_plist').then((response) => {
      let lines = response.split('\n') // Split multiline text into separate lines
      lines.splice(0, 1) // remove top two lines of dashes
      lines.splice(1, 1) // remove dashes beneath column names
      lines.splice(lines.length - 2, lines.length) // remove bottom 3 lines of dashes

      let newtext = lines.join('\n') // rejoin into multiline string
      const users = parseColumns(newtext) // parse player list into object

      websocket.send(JSON.stringify({
        op: 'LISTPLAYERS_RESPONSE',
        c: users,
        id: msg.id
      }))
    })
  })
}
