const { nanoid } = require('nanoid');
const redisHelper = require('./redisHelper.js')
const { redisClient } = require('../redis.js')
const roomAbleToStart = require('../middleware/roomAbleToStart.js')
const _ = require('lodash');
const { taskTimers, insertedTask } = require('./taskTimerVars.js')
const { durationOfRooms } = require('./roomTimerVars.js')
const { taskToCommand } = require('./taskToCommand.js')

const inputInfo = require("./inputInfo.js");

const Task = require("../task.js");
const Panel = require('../panel.js');

module.exports = function(io){
    const panelType = ['button', 'slider', 'sequenceButton', 'lever', 'rotatingDial', 'joystick', 'keypad', 'toggle']
    
    const firstNamePool = ['Rardo', 'Fantago', 'Lingubo', 'Leibniz', 'Phase', 'Alpha', 'Coperni', 'Joseph', 'Mass', 'Bose']
    const secondNamePool = ['bar', 'aligner', 'morpher', 'dagger', 'meter', 'sift', 'cycle', 'joestar']

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
        let penaltyAmount = 3;
        redisClient.json_get(roomCode, '.', function(err, roomInfo){
            if(err){
                console.log(err);
            } else{
                // When generating tasks, make sure that the task is unique to the panel
                try{
                    roomInfo = JSON.parse(roomInfo)
                    playerInfo = roomInfo['playerInfo'];
                    
                    delete playerInfo[sessionID]
                    let giverSID = _.sample(Object.keys(playerInfo));

                    let panelList = playerInfo[giverSID]['panelList']

                    let insertedTaskList = insertedTask[[roomCode]]
                    let randomPanelPool = _.difference(Object.keys(panelList), insertedTaskList)
                    let panelUID = _.sample(randomPanelPool);
                    insertedTask[[roomCode]].push(panelUID)
                    let randomPanel = panelList[panelUID];
                    
                    let taskName = randomPanel.name;
                    let taskType = inputInfo.indexTopanelType[randomPanel.typeIndex]
                    let taskCategory = randomPanel.category;
                    
                    let newTask = new Task(taskName, giverSID, sessionID, 1, panelUID, taskType, taskCategory);
                    
                    if(taskCategory === "string"){
                        let stringRange = inputInfo.stringRange[taskType];
                        newTask.extraInfo = _.shuffle(_.range(1, stringRange + 1)).slice(0,4).toString().replace(new RegExp(/,/g), "");
                        
                    } else if(taskCategory === "numeric") {
                        let numericRange = inputInfo.numericRange[taskType];
                        // Don't forget to check if input type is toggle, ask yowen at what size does the input size becomes larger as well
                        if(taskType === "slider" && randomPanel.size >= 2){
                            numericRange = 5;
                        }
                        newTask.extraInfo = _.sample(_.range(1, (numericRange + 1)));
                    }

                    // Callback to initialize timer once task is inside redis
                    const callback = function(panel){
                        let duration = _.random(12,15);
                        redisClient.json_get('playerSockets', sessionID, function(err, socketID){
                            if(err){
                                console.log(err)
                            } else{
                                socketID = socketID.toString().replace(new RegExp(/"/g), "")
                                console.log(newTask)
                                io.to(socketID).emit('newTask', taskToCommand(newTask), duration)
                                taskTimers[panel] = setInterval(function(){
                                    duration -= 1;
                                    io.to(socketID).emit('taskTimer', duration)
                                    if(duration <= 0){
                                        durationOfRooms[roomCode] -= penaltyAmount
                                        io.to(socketID).emit('penalty', penaltyAmount)
                                        // Create new task here
                                        insertedTask[[roomCode]] = _.without(insertedTask[[roomCode]], panel)
                                        clearInterval(taskTimers[panel])
                                        delete taskTimers[panel]
                                        createTask(roomCode, sessionID)
                                    }
                                    // For each second emit to a particular socketID
                                }, 1000)
                            }
                        })
                    };
                    redisHelper.addTask(roomCode, panelUID, newTask, callback);
                } catch(err){
                    console.log(err)
                }
            }
        })
    };
    
    function createPanelForRoom(roomCode, callback = function(){}){
        let distribution = [4, 5, 5, 6];
        distribution = _.shuffle(distribution)
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
                        let category = inputInfo.typeToCategory[type];
                        let name = _.sample(firstNamePool) + _.sample(secondNamePool);
                        
                        let panelID = nanoid();
                        let newPanel = new Panel(name, panelTypeIndex, category, size);
                        
                        panelList[panelID] = newPanel;
                    }
                    redisHelper.addPanelList(roomCode, sid, panelList, arrangement, callback);
                    redisClient.json_get('playerSockets', sid, function(err, socketID){
                        if(err){
                            console.log(err);
                        } else{
                            socketID = socketID.toString().replace(new RegExp(/"/g), "")
                            io.to(socketID).emit('newRound', panelList, arrangement)
                        }
                    })
                };   
            }
        });
    };

    function newRound(roomCode){
        const callback = function(sessionID){
            createTask(roomCode, sessionID)
        }
        createPanelForRoom(roomCode, callback);
    }

    io.on('connection', function(socket){
        const sessionID = socket.handshake.sessionID;
        socket.on('start', function(){
            // Generate panel distribution amount of 4,5,5,6
            let roomCode = socket.roomCode;
            console.log(roomCode)
            // Make this a generic new round function, since the process is the same for new rounds
            newRound(roomCode, sessionID, socket)
        })
        socket.on('test', function(arg){
            // Test function for literally anything
            
        })
    })
}