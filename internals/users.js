const path = require('path')
const fs = require('fs')

let records
const usersFile = fs.readFileSync(path.join(__dirname, '/../users.json'))

try {
  records = JSON.parse(usersFile).records
  global.log.info('User record file verification successful.')
  records.map(r => checkUserFormatting(r))
  global.log.info('User record format verification successful.')
} catch (e) {
  global.log.error('User record loading failed: Malformed file "users.json". A more specific error reason will be given below.')
  global.log.error(e.message)
  global.log.error('Exiting...')
  process.exit()
}

// Function to verify that the formatting of each user object is correct
function checkUserFormatting (userObj) {
  let res = { username: false, password: false }

  // Username exists and is a string, password exists and is a string
  if (userObj.username && typeof userObj.username === 'string') res.username = true
  if (userObj.password && typeof userObj.password === 'string') res.password = true

  const fields = Object.values(res)

  if (fields.map(val => val === true).length === fields.length) return true // eslint-disable-line brace-style
  else {
    throw new Error(`Malformed user object: ${JSON.stringify(userObj)} does not pass formatting requirements outlined in example`)
  }
}

function checkCredentials (username, password) {
  const user = records.find(r => r.username === username && r.password === password)
  return user ? true : false // eslint-disable-line no-unneeded-ternary
}

exports.checkCredentials = checkCredentials
