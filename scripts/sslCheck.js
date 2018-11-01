const fs = require('fs-extra')
const ora = require('ora')

function sslCheck () {
  const checkSpinner = ora('SSL enabled. Starting environment variable verification...').start()

  if (JSON.parse(process.env.SSL_USE_PFX)) {
    checkSpinner.text = 'PFX mode enabled. Checking file...'

    const pfxFileExists = fs.existsSync(process.env.SSL_PFX_FILE)

    if (!pfxFileExists) {
      checkSpinner.fail('PFX file not found. Please verify the path you set in .env is correct and try again.')
      process.exit(1)
    } else {
      checkSpinner.succeed('PFX file found. Good to go!')
      process.exit(0)
    }
  } else {
    checkSpinner.text = 'Normal mode enabled. Checking files...'

    const keyExists = fs.existsSync(process.env.SSL_KEY)
    const certExists = fs.existsSync(process.env.SSL_CERT)

    const failures = []

    if (!keyExists) failures.push('SSL private key file not found. Please verify the path you set in .env is correct and try again.')
    if (!certExists) failures.push('SSL certificate file not found. Please verify the path you set in .env is correct and try again.')

    if (failures.length > 0) {
      checkSpinner.fail('Some of the certificate files were not found. Spotted issues will be provided below.')
      failures.forEach(fail => console.log(`- ${fail}`))
      process.exit(1)
    } else {
      checkSpinner.succeed('All certificate files found. Good to go!')
      process.exit(0)
    }
  }
}

module.exports = sslCheck
