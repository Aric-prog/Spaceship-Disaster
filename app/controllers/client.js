const express = require('express')
const path = require('path')
const router = express.Router()
router.get('/', function(req, res){
    req.session.test = "imagine";
    res.sendFile(path.join(__dirname, '../client', 'test_client.html'));
})

module.exports = router;