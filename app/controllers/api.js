const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/login', function(req, res){
    // Login function that checks with database goes here
    req.session.randomVar = 5;
    console.log(req.session);
    res.json("now logged in ");
})

router.use('/*', auth)
router.get('/leaderboard', function(req, res){
    // Get leaderboard data
})
router.post('/leaderboard', function(req, res){
    // Post leaderboard data, leaderboard data will be in the form of 'Team name - Time survived - Rounds'
})

module.exports = router