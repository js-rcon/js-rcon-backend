module.exports = (RCONConnection, websocket, msg) => {
  RCONConnection.command('maps *').then(response => {
    // Process data into autocompleteable array
    response = response.replaceAll('PENDING:   (fs) ', '').replaceAll('-', '').replaceAll('\n', ' ') // Remove superflous data
    response = response.trim().split(' ') // Safely convert into array

    websocket.send(JSON.stringify({
      op: 'LISTMAPS_RESPONSE',
      c: response,
      id: msg.id
    }))
  }).catch(err => global.rconerror(__filename, err))
}
