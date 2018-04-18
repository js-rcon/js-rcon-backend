const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    console.log('hello')
    console.log('TEST')
    res.send('Hello!')
})

module.exports = router