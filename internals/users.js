const ora = require('ora')
const path = require('path')
const fs = require('fs')

const userLog = ora('Verifying user records...').start()

let records
const usersFile = fs.readFileSync(path.join(__dirname, '/../users.json'))

try {
  records = JSON.parse(usersFile).records
  userLog.text = 'User record file verification successful. Verifying format...'
  records.map(r => checkUserFormatting(r))
  userLog.succeed('User record verification successful.')
} catch (e) {
  userLog.fail('User record verification failed: Malformed file "users.json". A more specific error reason will be given below. The program will now terminate.')
  global.log.error(e.message)
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
