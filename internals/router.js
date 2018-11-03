const router = require('express').Router()
const { initSession, getSession, terminateSession } = require('./session')
const { checkCredentials } = require('./users')

router.get('/status', async (req, res) => {
  let session
  try {
    session = await getSession(req.headers['token'])
  } catch (err) {
    if (err.message === 'Invalid token format') {
      global.log.debug(`[status] Attempted to get session for token "${req.headers['token']}", but the format was invalid.`)
    } else {
      global.log.error(`[status] An error occurred while getting session for token "${req.headers['token']}":`, err)
      res.status(500).send({ username: null, token: null, error: err })
      return
    }
  }

  if (!session || Object.keys(session).length === 0) { // Session is not active
    res.status(200).send({
      username: null,
      token: null,
      error: null
    })
  } else {
    res.status(200).send({
      username: session.id,
      token: req.headers['token'], // Returning the same token as it is valid
      error: null
    })
  }
})

// Note: Only the /auth route supports username/password authentication, all others use session IDs
// This is because /auth is used for explicit login and /status is used for session validity checks

router.post('/auth', async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send({
      username: null,
      token: null,
      error: 'Missing request body parameter "username" and/or "password"'
    })
  }

  const authed = checkCredentials(req.body.username, req.body.password)

  if (!authed) {
    global.log.warn(`[auth] Received invalid login for user "${req.body.username}" (IP ${req.ip}).`)

    res.status(401).send({
      username: null,
      token: null,
      error: 'Invalid username or password'
    })
  } else {
    let token
    try {
      token = await initSession(req.body.username, req.ip)
    } catch (err) {
      global.log.error(`[auth] An error occurred while initialising session for user "${req.body.username}" (IP ${req.ip}):`, err)
      res.status(500).send({
        username: null,
        token: null,
        error: err
      })
      return
    }

    global.log.info(`User "${req.body.username}" (IP ${req.ip}) logged in.`)

    res.status(200).send({
      username: req.body.username,
      token: token,
      error: null
    })
  }
})

router.post('/logout', async (req, res) => {
  if (req.body.token) {
    try {
      await terminateSession(req.body.token)
    } catch (err) {
      if (err.message === 'Invalid token format') {
        global.log.warn(`[logout] Attempted to terminate session for token "${req.body.token}", but the format was invalid.`)
      } else {
        global.log.error(`[logout] An error occured while terminating session "${req.body.token}":`, err)
        res.status(500).send({ loggedOut: false, error: err })
        return
      }
    }
  }

  global.log.info(`User "${req.body.username || '<unknown user>'}" (IP: ${req.ip}) logged out.`)
  res.status(200).send({ loggedOut: true, error: null })
})

module.exports = router
