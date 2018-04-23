const path = require('path')
const fs = require('fs')

let records
const usersFile = fs.readFileSync(path.join(__dirname, '/../users.json'))

try {
  records = JSON.parse(usersFile).records
} catch (e) {
  global.log.error('User record loading failed: Malformed or missing file "users.json". Exiting...')
  process.exit()
}

exports.checkValidityByUsername = (username, password) => {
  const user = records.find(r => r.username === username && r.password === password)
  return user || null
}

exports.checkValidityById = id => {
  const user = records.find(r => r.id === id)
  return user || null
}
