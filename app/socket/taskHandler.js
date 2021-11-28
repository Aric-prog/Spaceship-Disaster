const { nanoid } = require('nanoid');
const redisHelper = require('./redisHelper.js')
const { redisClient } = require('../redis.js')
const roomAbleToStart = require('../middleware/roomAbleToStart.js')
const underscore = require('underscore')

module.exports = function(io){
    let taskTimers = {}
    const panelType = ['lever', 'button', 'slideBar', 'rotateDial', 'keypad', 'sequence', 'joystick', 'toggle']

    const firstNamePool = ['Rardo', 'Fantago', 'Lingubo', 'Leibniz', 'Phase', 'Alpha', 'Coperni', 'Joseph', 'Mass', 'Bose']
    const secondNamePool = ['bar', 'aligner', 'morpher', 'dagger', 'meter', 'sift', 'cycle']

    io.on('connection', function(socket){
        const sessionID = socket.handshake.sessionID;
        socket.use(roomAbleToStart)
        socket.on('start', function(){
            
            // Generate panel distribution amount of 4,5,5,6
            let roomCode = socket.roomCode;
            let distribution = [4,5,5,6]
            redisClient.json_get(roomCode, '.playerInfo', function(err, playerInfo){
                if(err){
                    console.log(err);
                } else{
                    let roomSessionIDList = (Object.keys(JSON.parse(playerInfo)));
                    underscore.shuffle(roomSessionIDList);
                    for(const sid of roomSessionIDList){
                        let amountOfPanel = distribution.pop();
                        let panelList = {};
                        
                        for(const i of Array(amountOfPanel).keys()){
                            let firstNameIndex = Math.floor(Math.random() * firstNamePool.length);
                            let secondNameIndex = Math.floor(Math.random() * secondNamePool.length);
                            
                            let randomName = firstNamePool[firstNameIndex] + secondNamePool[secondNameIndex];
                            let type = panelType[Math.floor(Math.random() * panelType.length)];
                            
                            panelList[randomName] = type;
                        }
                        redisHelper.addPanelList(roomCode, sid, panelList);
                    }   
                }
            })

            
            // Generate task list here from the available panels and their names
        })
        socket.on('error', function(err){
            console.log('err : ' + err);
        })
    })
}