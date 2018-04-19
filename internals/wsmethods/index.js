const fs = require('fs')
const path = require('path')

module.exports = function (readFrom) {
  let allFiles = fs.readdirSync(readFrom)
  let allMethods = {}

  allFiles.forEach((file) => {
    if (file.endsWith('.js') && file !== 'index.js') {
      allMethods[file.substring(0, file.length - 3).toUpperCase()] = require(path.resolve(__dirname, file))
    }
  })
  return allMethods
}
