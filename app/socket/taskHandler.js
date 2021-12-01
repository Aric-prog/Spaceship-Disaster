const { nanoid } = require('nanoid');
const redisHelper = require('./redisHelper.js')
const { redisClient } = require('../redis.js')
const roomAbleToStart = require('../middleware/roomAbleToStart.js')

const inputTypes = require("./inputTypes.js");
const { Task } = require("../task.js");

const _ = require('lodash');
const Panel = require('../panel.js');

module.exports = function(io){
    let taskTimers = {}
    const panelType = ['button', 'slider', 'sequenceButton', 'lever', 'rotatingDial', 'joystick', 'keypad', 'toggle']
    
    const firstNamePool = ['Rardo', 'Fantago', 'Lingubo', 'Leibniz', 'Phase', 'Alpha', 'Coperni', 'Joseph', 'Mass', 'Bose']
    const secondNamePool = ['bar', 'aligner', 'morpher', 'dagger', 'meter', 'sift', 'cycle']

    const arrangementForSize = {
        4 : [[1, 2, 2, 4], [1, 1, 3, 4], [1, 2, 3, 3], [2, 2, 2, 3]], 
        5 : [[1, 2, 2, 2, 2], [1, 1, 1, 3, 3], [1, 1, 1, 2, 4], [1, 1, 2, 2, 3]], 
        6 : [[1, 1, 1, 1, 1, 4], [1, 1, 1, 2, 2, 2], [1, 1, 1, 1, 2, 3]]
    };

    const panelTypePossibility = {
        1 : [0, 2, 4, 5, 6, 1, 3], 
        2 : [3, 1, 7], 
        3 : [3, 1, 7], 
        4 : [0, 2, 4, 5, 6, 3]
    };

    function createTask(roomCode, sessionID){
        redisClient.json_get(roomCode, 'playerInfo', function(err, playerInfo){
            if(err){
                console.log(err);
            } else{
                playerInfo = JSON.parse(playerInfo);

                console.log(playerInfo)

                let giverSID = _.sample(Object.keys(playerInfo));

                let randomTask = _.sample(playerInfo[giverSID]['panelList']);
                let taskName = randomTask['taskName'];
                let taskType = inputTypes.typeToGeneric[taskName];
                
                console.log(taskType);
                let newTask = new Task(taskName, giverSID, sessionID, 1, "sample");
                // if(taskType === "string"){
                //     let stringRange = inputTypes.stringRange[taskName];
                //     newTask.extraInfo = _.shuffle(_.range(1, stringRange + 1)).toString().replace(new RegExp(/,/g), "");
                // } else if(taskType === "numeric") {
                //     let numericRange = inputTypes.numericRange[taskName];

                //     if(taskName === "" && ){
                        
                //     } else{
                //         newTask.extraInfo = _.sample(_.range(1, (numericRange + 1)));
                //     }
                // }
            }
        })
    };
    
    function createPanelForRoom(roomCode){
        let distribution = [4, 5, 5, 6];
        
        redisClient.json_get(roomCode, '.playerInfo', function(err, playerInfo){
            if(err){
                console.log(err);
            } else{
                let roomSessionIDList = (Object.keys(JSON.parse(playerInfo)));
                _.shuffle(roomSessionIDList);
                
                for(const sid of roomSessionIDList){
                    let amountOfPanel = distribution.pop();
                    let panelList = {};
                    
                    let arrangement = _.sample(arrangementForSize[amountOfPanel]);
                    for(const size of arrangement){
                        let panelTypeIndex = _.sample(panelTypePossibility[size]);

                        let type = panelType[panelTypeIndex];
                        let category = inputTypes.typeToGeneric[type];
                        let name = _.sample(firstNamePool) + _.sample(secondNamePool);
                        
                        let taskID = nanoid();
                        let newPanel = new Panel(name, type, category, size);
                        
                        panelList[taskID] = newPanel;
                    }
                    redisHelper.addPanelList(roomCode, sid, panelList);
                };
            }
        });
    };

    function newRound(){

    }

    io.on('connection', function(socket){
        const sessionID = socket.handshake.sessionID;
        socket.use(roomAbleToStart)
        socket.on('start', function(){
            // Generate panel distribution amount of 4,5,5,6
            
            let roomCode = socket.roomCode;
            
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
        socket.on('test', function(){
            let roomCode = socket.roomCode;
            redisClient.json_get(roomCode, '.', function(err, playerInfo){
                if(err){
                    console.log(err)
                } else{
                    console.log(JSON.parse(playerInfo))
                }
            })
            // createTask(roomCode, sessionID);
        })
        socket.on('error', function(err){
            console.log('err : ' + err);
        })
    })
}