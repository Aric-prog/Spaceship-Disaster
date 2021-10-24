const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()

// router.use('/*', auth)
router.get('/leaderboard', function(req, res){
    console.log("tesltkj")
    // Get leaderboard data
})
router.post('/leaderboard', function(req, res){
    // Post leaderboard data, leaderboard data will be in the form of 'Team name - Time survived - Rounds'
})

module.exports = router