const express = require('express')
const path = require('path')
const router = express.Router()
router.get('/testing', function(req, res){
    res.sendFile(path.join(__dirname, '../client', 'test_socket.html'));
});
router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '../client', 'learning.html'));
});
router.get('/register', function(req, res){
    res.sendFile(path.join(__dirname, '../client', 'test_register.html'));
});
router.get('/login', function(req, res){
    res.sendFile(path.join(__dirname, '../client', 'test_login.html'));
});
router.get('/leaderboard', function(req, res){
    res.sendFile(path.join(__dirname, '../client', 'test_leaderboard.html'));
});

module.exports = router;