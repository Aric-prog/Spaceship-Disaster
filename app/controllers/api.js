const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('../model/user')
const bcrypt = require('bcryptjs')

mongoose.connect('mongodb://localhost:27017/user-app-db',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//drop database
//mongoose.connection.dropDatabase();

router.use(bodyParser.json())

router.post('/register_user', async (req, res) => {
    console.log(req.body)
    const {email,username,password:plainTextPassword} = req.body
    if(!email || typeof email!== 'string'){
        return res.json({status: 'error', error: 'Invalid Email'})
    }
    if(!username || typeof username!== 'string'){
        return res.json({status: 'error', error: 'Invalid Username'})
    }
    if(!plainTextPassword || typeof plainTextPassword!== 'string'){
        return res.json({status: 'error', error: 'Invalid Password'})
    }
    if(plainTextPassword.length < 6){
        return res.json({status:'error', error: 'Password need to be at least 6 or longer'})
    }
    
    //hashing password
    const password = await bcrypt.hash(plainTextPassword, 10)

    try {
        const response = await User.create({
            email,
            username,
            password
        })
        console.log('User created succesfully', response)
        
    } catch (error){
        if (error.code === 11000){
            var regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i,      
            match =  error.message.match(regex),  
            indexName = match[1] || match[2];  
            if(indexName === 'email'){
                return res.json({status: 'error', error: 'Email has already been used'})
            }
            else{
                return res.json({status: 'error', error: 'Username has already been used'})
            }
        }
        throw error
    }
    res.json({status: 'ok'})
})

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