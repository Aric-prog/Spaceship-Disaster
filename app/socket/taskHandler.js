const { nanoid } = require('nanoid');
const redisHelper = require('./redisHelper.js')
const { redisClient } = require('../redis.js')
const roomAbleToStart = require('../middleware/roomAbleToStart.js')

const inputTypes = require("./inputTypes.js");
const { Task } = require("../task.js");

const _ = require('lodash')

module.exports = function(io){
    let taskTimers = {}
    const panelType = ['lever', 'button', 'slideBar', 'rotateDial', 'keypad', 'sequence', 'joystick', 'toggle']
    
    const firstNamePool = ['Rardo', 'Fantago', 'Lingubo', 'Leibniz', 'Phase', 'Alpha', 'Coperni', 'Joseph', 'Mass', 'Bose']
    const secondNamePool = ['bar', 'aligner', 'morpher', 'dagger', 'meter', 'sift', 'cycle']
    
    function createTask(roomCode, sessionID){
        redisClient.json_get(roomCode, 'playerInfo', function(err, playerInfo){
            if(err){
                console.log(err);
            } else{
                playerInfo = JSON.parse(playerInfo)
                
                let giverSID = _.random(Object.keys(playerInfo));
                let taskName = _.sample(Object.keys(playerInfo.giverSID.panelList));
                let taskType = inputTypes.typeToGeneric.taskName;
                
                let newTask = new Task(taskName, giverSID, sessionID, 1, "sample");
                if(taskType === "string"){
                    let stringRange = inputTypes.stringRange.taskName;
                    newTask.extraInfo = _.shuffle(_.range(1, stringRange + 1)).toString().replace(new RegExp(/,/g), "");
                } else if(taskType === "numeric") {
                    let numericRange = inputTypes.numericRange.taskName;
                    newTask.extraInfo = _.sample(_.range(1, (numericRange + 1)))
                }
            }
        })
    }
    
    function createPanelForRoom(roomCode){
        redisClient.json_get(roomCode, '.playerInfo', function(err, playerInfo){
            if(err){
                console.log(err);
            } else{
                let roomSessionIDList = (Object.keys(JSON.parse(playerInfo)));
                _.shuffle(roomSessionIDList);
                
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
                };
            }
        })
    }

    function newRound(){

    }

    io.on('connection', function(socket){
        const sessionID = socket.handshake.sessionID;
        socket.use(roomAbleToStart)
        socket.on('start', function(){
            // Generate panel distribution amount of 4,5,5,6
            
            let roomCode = socket.roomCode;
            let distribution = [4, 5, 5, 6];
            
            // Make this a generic new round function, since the process is the same for new rounds
            redisClient.json_get(roomCode, '.playerInfo', function(err, playerInfo){
                if(err){
                    console.log(err);
                } else{
                    let roomSessionIDList = (Object.keys(JSON.parse(playerInfo)));
                    _.shuffle(roomSessionIDList);
                    
                    createPanelForRoom(roomCode);
                }
            })
        })
        socket.on('error', function(err){
            console.log('err : ' + err);
        })
    })
}