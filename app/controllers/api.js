const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('../model/user')
const Leaderboard = require('../model/leaderboard')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'iasjndboipasnudiopasudnasdasdasasasdas'

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

router.post('/login_user', async (req, res) => {

    const {username, password} = req.body
    const user = await User.findOne({username}).lean()

    if(!user){
        return res.json({status:'error',error:'Invalid Username'})
    }

    if(await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({
            id:user._id, 
            username: user.username
        }, JWT_SECRET)
        console.log(token)
        req.session.randomVar = 5;
        console.log(req.session);
        return res.json({status:'ok', data:token})
    }


    res.json({status:'error' ,error:'invalid Username/password'})
})

router.use('/*', auth)
router.get('/get_leaderboard', function(req, res){
    // Get leaderboard data
    Leaderboard.find({}, function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      });
})
router.post('/post_leaderboard', async(req, res) =>{
    // Post leaderboard data, leaderboard data will be in the form of 'Team name - Time survived - Rounds'
    const {team_name, time, round} = req.body
    try {
        const response = await Leaderboard.create({
            team_name,
            time,
            round
        })
        console.log('Leaderboard posted succesfully',response)
        
    } catch (error){
        throw error
    }
    res.json({status: 'ok'})
})


module.exports = router