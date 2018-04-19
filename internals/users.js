const path = require('path')
const fs = require('fs')
let records
let usersFile = fs.readFileSync(path.join(__dirname, '/../users.json'))
try {
  records = JSON.parse(usersFile).records
} catch (e) {
  log.error('Malformed or missing users.json file!') // eslint-disable-line
  process.exit()
}

exports.checkValidityByUsername = (username, password) => {
  let user = records.find(r => r.username === username && r.password === password)
  if (user) return user
  if (!user) return null
}

exports.checkValidityById = (id) => {
  let user = records.find(r => r.id === id)
  if (user) return user
  if (!user) return null
}
