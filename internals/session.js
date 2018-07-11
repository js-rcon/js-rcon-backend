const RedisSessionStore = require('redis-sessions')

const redisSessions = new RedisSessionStore({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || '6379'
})

function pingServer () {
  redisSessions.ping((err, res) => {
    if (err) global.log.error(`An error occured while pinging the Redis server: ${err}`)
    else global.log.info(`Connected to Redis server at http://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT}.`)
  })
}

/**
 * Initialise a session for a user.
 * @param {String} username
 * @param {String} requestIp
 * @returns {Promise<String>} Session token.
 */
function initSession (username, requestIp) {
  return new Promise((resolve, reject) => {
    redisSessions.create({
      app: process.title,
      id: username,
      ip: requestIp,
      ttl: 3600 // Sessions live for an hour at a time
    }, (err, res) => {
      // `An error occurred while initialising session for user "${username}" (IP ${requestIp}): ${err}`
      if (err) reject(err)
      else resolve(res.token)
    })
  })
}

/**
 * Get session information for a token.
 * @param {String} sessionToken
 * @returns {Promise<Object>} Session information - see https://www.npmjs.com/package/redis-sessions#get-a-session-for-a-token
 */
function getSession (sessionToken) {
  return new Promise((resolve, reject) => {
    redisSessions.get({
      app: process.title,
      token: sessionToken
    }, (err, res) => {
      // `An error occurred while getting session for token "${sessionToken}": ${err}`
      if (err) reject(err)
      else resolve(res)
    })
  })
}

/**
 * Terminate a session.
 * @param {String} sessionToken
 * @returns {Promise<Number>} 1 if session was killed or 0 if session was not found.
 */
function terminateSession (sessionToken) {
  return new Promise((resolve, reject) => {
    redisSessions.kill({
      app: process.title,
      token: sessionToken
    }, (err, res) => {
      // `An error occured while terminating session "${sessionToken}": ${err}`
      if (err) reject(err)
      else resolve(res.kull)
    })
  })
}

/**
 * Get all sessions that were active within the last 10 minutes.
 * @returns {Promise<Array>} Recently active sessions.
 */
function getRecentlyActiveSessions () {
  return new Promise((resolve, reject) => {
    redisSessions.soapp({
      app: process.title,
      dt: 600 // 10 minutes
    }, (err, res) => {
      // `An error occured while getting recently active sessions: ${err}`
      if (err) reject(err)
      else resolve(res.sessions)
    })
  })
}

/**
 * Get all sessions that are currently active for a user.
 * @param {String} username
 * @returns {Promise<Array>} Sessions.
 */
function getSessionsForUser (username) {
  return new Promise((resolve, reject) => {
    redisSessions.soid({
      app: process.title,
      id: username
    }, (err, res) => {
      // `An error occured while getting sessions for user "${username}": ${err}`
      if (err) reject(err)
      else resolve(res.sessions)
    })
  })
}

/**
 * Terminate all sessions belonging to a user.
 * @param {String} username
 * @returns {Promise<Number>} Number of sessions terminated.
 */
function terminateAllSessionsForUser (username) {
  return new Promise((resolve, reject) => {
    redisSessions.killsoid({
      app: process.title,
      id: username
    }, (err, res) => {
      // `An error occurred while terminating all sessions for user "${username}": ${err}`
      if (err) reject(err)
      else resolve(res.kill)
    })
  })
}

module.exports = {
  pingServer: pingServer,
  initSession: initSession,
  getSession: getSession,
  terminateSession: terminateSession,
  getRecentlyActiveSessions: getRecentlyActiveSessions,
  getSessionsForUser: getSessionsForUser,
  terminateAllSessionsForUser: terminateAllSessionsForUser
}
