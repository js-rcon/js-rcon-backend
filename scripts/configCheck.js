const fs = require('fs-extra')
const path = require('path')
const download = require('download-file')
const ora = require('ora')
const sslCheck = require('./sslCheck')

const checkSpinner = ora('Checking for config file .env...').start()

const envExists = fs.existsSync(path.join(process.cwd(), '.env'))
const defaultEnvExists = fs.existsSync(path.join(process.cwd(), '.env.example'))

if (!envExists) {
  checkSpinner.text = 'Config file .env not found. Checking for default configuration file .env.example...'

  if (!defaultEnvExists) {
    checkSpinner.warn('Default configuration file .env.example not found.')
    downloadEnv()
  } else {
    checkSpinner.succeed('Default configuration file .env.example found.')
    copyFromDefaultEnv()
  }
} else {
  checkSpinner.succeed('Config file .env found.')
  ensureEnvVars()
}

function ensureEnvVars () {
  const ensureSpinner = ora('Verifying that mandatory environment variables are set...').start()
  require('dotenv').config()

  const failures = []

  const mandatory = {
    RCON_ADDRESS: 'serveraddress',
    RCON_PASSWORD: 'serverpass',
    STEAM_API_KEY: 'xxx'
  }

  // Filter process.env to only the mandatory variables...
  const mandatoryInEnv = Object.keys(process.env).filter(key => Object.keys(mandatory).includes(key))

  for (let i in mandatory) {
    // Check if the current mandatory environment variable exists in the environment
    if (!mandatoryInEnv.includes(i)) failures.push(`Mandatory environment variable ${i} was not set in .env.`)
    else if (mandatory[i] === process.env[i]) failures.push(`Mandatory environment variable ${i} is unconfigured.`)
  }

  if (failures.length > 0) {
    ensureSpinner.fail('Some mandatory environment variables were not set. Spotted issues will be provided below.')
    failures.forEach(fail => console.log(`- ${fail}`))
    process.exit(1)
  } else {
    ensureSpinner.succeed('All mandatory environment variables set. Good to go!')
    if (JSON.parse(process.env.ENABLE_HTTPS)) sslCheck()
    process.exit(0) // In case the SSL check isn't run, otherwise that function will cause process exit
  }
}

function downloadEnv () {
  const downloadSpinner = ora('Downloading default configuration file from GitHub...').start()

  const originalConfig = 'https://raw.githubusercontent.com/js-rcon/js-rcon-backend/master/.env.example'

  const dlOptions = {
    directory: process.cwd(),
    filename: '.env.example'
  }

  const fsOptions = {
    src: path.join(process.cwd(), '.env.example'),
    dest: path.join(process.cwd(), '.env')
  }

  download(originalConfig, dlOptions, err => {
    if (err) downloadSpinner.fail(`Could not download default configuration file:\n\n${err}`)
    else {
      downloadSpinner.text = 'Default configuration file downloaded into .env.example. Writing into .env...'

      fs.copy(fsOptions.src, fsOptions.dest, err => {
        if (err) downloadSpinner.fail(`Could not write configuration file .env!\n\n${err}`)
      })

      downloadSpinner.succeed('Default configuration file downloaded into .env. Feel free to edit any settings you need.')
    }
  })
}

function copyFromDefaultEnv () {
  const copySpinner = ora('Copying settings from .env.example...').start()

  const options = {
    src: path.join(process.cwd(), '.env.example'),
    dest: path.join(process.cwd(), '.env')
  }

  fs.copy(options.src, options.dest, err => {
    if (err) copySpinner.fail(`Could not copy from .env.example to .env!\n\n${err}`)
    else copySpinner.succeed('Copied default configuration values from .env.example to .env. Feel free to edit any settings you need.')
  })
}
