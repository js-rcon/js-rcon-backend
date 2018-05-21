const parseColumns = require('parse-columns')
const SteamID = require('steamid')
const SteamWebAPI = require('steam-web')
let steamInfoFetcher

if (process.env.STEAM_API_KEY) {
  steamInfoFetcher = new SteamWebAPI({
    apiKey: process.env.STEAM_API_KEY,
    format: 'json'
  })
} else {
  global.logger.warn('No Steam API key provided, player list functionality will be limited.')
}

let connectedUsers = []

function populateInfoConnectedUsers (tempUsers) {
  return new Promise((resolve, reject) => {
    tempUsers.map((user) => {
      if (!user.steamid64) {
        user.steamid64 = new SteamID(user.SteamID).getSteamID64()
        return user
      } else {
        return user
      }
    })
    let needsMoreInfo = []
    tempUsers.forEach((user) => {
      if (!user.avatarmedium) {
        needsMoreInfo.push(user.steamid64)
      }
    })
    if (needsMoreInfo.length !== 0) {
      steamInfoFetcher.getPlayerSummaries({
        steamids: needsMoreInfo,
        callback: (err, data) => {
          if (err) reject(err)
          else {
            data.response.players.forEach((infoPlayer) => {
              let userToChange = tempUsers.find(u => u.steamid64 === infoPlayer.steamid)
              userToChange.avatarmedium = infoPlayer.avatarmedium
              userToChange.profileurl = infoPlayer.profileurl
              if (infoPlayer.communityvisibilitystate === 1) {
                userToChange.private = true
              } else {
                userToChange.private = false
              }
              if ((new Date().getTime() - new Date(infoPlayer.timecreated * 1000).getTime()) < 604800000) {
                userToChange.young = true
              } else if (!isNaN(new Date(infoPlayer.timecreated))) {
                userToChange.young = false
              } else {
                userToChange.young = 'Private profile, cannot check'
              }
            })
            resolve(tempUsers)
          }
        }
      })
    } else {
      resolve(tempUsers)
    }
  })
}

module.exports = (RCONConnection, websockets) => {
  return new Promise((resolve, reject) => {
    RCONConnection.command('sm_plist').then((response) => {
      let lines = response.split('\n') // Split multiline text into separate lines
      lines.splice(0, 1) // remove top two lines of dashes
      lines.splice(1, 1) // remove dashes beneath column names
      lines.splice(lines.length - 2, lines.length) // remove bottom 3 lines of dashes

      let newtext = lines.join('\n') // rejoin into multiline string
      let users = parseColumns(newtext) // parse player list into object
      if (connectedUsers.length === 0 && users.length >= 1) {
        connectedUsers = users
      }
      if (connectedUsers.length !== users.length) {
        connectedUsers = users
      }
      if (steamInfoFetcher) {
        populateInfoConnectedUsers(connectedUsers).then((populatedUsers) => {
          if (connectedUsers.map(u => u.steamid64).length !== populatedUsers.map(u => u.steamid64).length) {
            connectedUsers = populatedUsers
          }
          websockets.forEach((websocket) => {
            websocket.send(JSON.stringify({
              op: 'HEARTBEAT_RESPONSE',
              c: connectedUsers
            }))
          })
        }).catch(global.log.error)
      } else {
        websockets.forEach((websocket) => {
          websocket.send(JSON.stringify({
            op: 'HEARTBEAT_RESPONSE',
            c: connectedUsers
          }))
        })
      }
    })
  })
}
