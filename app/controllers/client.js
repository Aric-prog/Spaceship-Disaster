const express = require('express')
const path = require('path')
const router = express.Router()
router.get('/testing', function(req, res){
    res.sendFile(path.join(__dirname, '../client', 'test_socket.html'));
});
router.get('/', function(req, res){
<<<<<<< HEAD
    res.sendFile(path.join(__dirname, '../client', 'main_menu.html'));
});

=======
    res.sendFile(path.join(__dirname, '../client', 'test_babylon.html'));
})
router.get('/kambing', function(req, res){
    res.sendFile(path.join(__dirname, '../client', 'learning.html'));
})
>>>>>>> 7e7b6d98ec59c5b550e45989e13017515aa814f8

module.exports = router;