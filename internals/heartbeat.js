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
  global.log.warn('No Steam API key provided, player list functionality will be limited.')
}

let connectedUsers = []

function populateInfoConnectedUsers (tempUsers) {
  return new Promise((resolve, reject) => {
    // Patch in SteamID64s for users without them
    tempUsers.map(user => {
      if (!user.steamid64) user.steamid64 = new SteamID(user.SteamID).getSteamID64()
      return user
    })

    let needsMoreInfo = []
    tempUsers.forEach((user) => {
      if (!user.avatarmedium) {
        needsMoreInfo.push(user.steamid64)
      }
    })

    if (needsMoreInfo.length > 0) {
      steamInfoFetcher.getPlayerSummaries({
        steamids: needsMoreInfo,
        callback: (err, data) => {
          if (err) reject(err)
          else {
            data.response.players.forEach(infoPlayer => {
              // Patch in the data received from the server
              let userToChange = tempUsers.find(u => u.steamid64 === infoPlayer.steamid)
              userToChange.avatarmedium = infoPlayer.avatarmedium
              userToChange.profileurl = infoPlayer.profileurl

              // Check if user is private
              infoPlayer.communityvisibilitystate === 1 ? userToChange.private = true : userToChange.private = false

              // Check for private profile
              if (isNaN(new Date(infoPlayer.timecreated))) userToChange.young = 'Private profile, cannot check' // TODO: Return null for private profile?
              else {
                userToChange.young = false // Implicitly cast user as not young unless criteria is met
                // Check if the account is newer than one week
                if ((Date.now() - new Date(infoPlayer.timecreated * 1000).getTime()) < 604800000) userToChange.young = true
              }
            })
            resolve(tempUsers)
          }
        }
      })
    } else resolve(tempUsers) // No additional information required, resolve as such
  })
}

module.exports = (RCONConnection, websockets) => {
  return new Promise((resolve, reject) => {
    RCONConnection.command('sm_plist').then(response => {
      const lines = response.split('\n')
      lines.splice(0, 1) // remove top two lines of dashes
      lines.splice(1, 1) // remove dashes beneath column names
      lines.splice(lines.length - 2, lines.length) // remove bottom 3 lines of dashes

      const newtext = lines.join('\n') // rejoin into multiline string
      const usersOnServer = parseColumns(newtext) // parse player list into object

      // If a data mismatch is evident, refresh data
      if (connectedUsers.length !== usersOnServer.length) connectedUsers = usersOnServer

      if (steamInfoFetcher) {
        populateInfoConnectedUsers(connectedUsers).then(populatedUsers => {
          if (connectedUsers.map(u => u.steamid64).length !== populatedUsers.map(u => u.steamid64).length) {
            connectedUsers = populatedUsers
          }

          websockets.forEach(websocket => {
            websocket.send(JSON.stringify({
              op: 'HEARTBEAT_RESPONSE',
              c: connectedUsers
            }))
          })
        }).catch(err => global.log.error(`An error occurred when getting player summaries:`, err))
      } else {
        websockets.forEach(websocket => {
          websocket.send(JSON.stringify({
            op: 'HEARTBEAT_RESPONSE',
            c: connectedUsers
          }))
        })
      }
    }).catch(err => {
      if (err.message === 'Command lost') global.log.debug('Command lost during heartbeat.')
      else global.rconerror(__filename, err)
    })
  })
}
