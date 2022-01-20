const { nanoid } = require('nanoid');
const redisHelper = require('./redisHelper.js')
const { redisClient } = require('../redis.js')
const _ = require('lodash');
const { taskTimers, insertedTask } = require('./taskTimerVars.js')
const { durationOfRooms } = require('./roomTimerVars.js')
const { taskToCommand } = require('./taskToCommand.js')
const attachRoomCode = require("../middleware/attachRoomCode.js");

const inputInfo = require("./inputInfo.js");

const Task = require("../task.js");
const Panel = require('../panel.js');

module.exports = function(io){
    const panelType = ['button', 'slider', 'sequenceButton', 'lever', 'rotatingDial', 'joystick', 'keypad', 'toggle']
    
    const firstNamePool = ['Rardo', 'Fantago', 'Lingubo', 'Leibniz', 'Phase', 'Alpha', 'Coperni', 'Joseph', 'Mass', 'Bose', 'Dio', 'Tako'
    , 'Fulgural', 'Iono', 'Crotal', 'Ecydisis', 'Zigand', 'Guerilla', 'Key', 'George', 'Furni', 'Zygote', 'Foobar', 'Mood', 'Sigma'
    , 'Sus', 'Amogus', 'Impsos', 'Omni', 'Dollop', 'Edgy', 'Spin', 'Fart', 'Areec', 'Yovven', 'Rona', 'Chronic', 'Mobile', 'Micro'
    , 'Spoder', 'Fort', 'Riot', 'Burrito', 'Drogo', 'Xyclobe', 'Shroom', 'Celphic', 'Myniric', 'Juvonic', 'Varona', 'Chromi', 'Tecito'
    , 'Calcula', 'Senuco', 'Munita', 'Naguric', 'Lusinic', 'Rifuna', 'Isoto', 'Parude']

    const secondNamePool = ['bar', 'aligner', 'morpher', 'dagger', 'meter', 'sift', 'cycle', 'joestar', 'brando', 'phone', 'disorber'
    , 'disposer', 'lysis', 'scape', 'globe', 'blaster', 'machine', 'system', 'blade' ,'philous', 'mancy', 'graph', 'noid', 'lite', 'male'
    , 'burner', 'trix', 'dever', 'charge' , 'chungus', 'jitsu', 'smeller', 'hernando', 'yowen', 'legend', 'adder', 'reducer', 'plexer'
    , 'silencer', 'nite', 'puller', 'morgan', 'faller', 'gamer', 'board', 'culler', 'moister', 'tiler', 'miner', 'eater', 'mizer', 'maxer'
    , 'butter', 'haster', 'dragger', 'shift', 'warper', 'nector', 'shutter', 'closer']


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
                    
                    let newTask = new Task(taskName, sessionID, giverSID, 1, panelUID, taskType, taskCategory);
                    
                    if(taskCategory === "string"){
                        let stringRange = inputInfo.stringRange[taskType];
                        newTask.extraInfo = _.shuffle(_.range(1, stringRange + 1)).slice(0,4).toString().replace(new RegExp(/,/g), "");
                        
                    } else if(taskCategory === "numeric") {
                        let numericRange = inputInfo.numericRange[taskType];
                        // Don't forget to check if input type is toggle, ask yowen at what size does the input size becomes larger as well
                        if(taskType === "slider" && randomPanel.size >= 2){
                            numericRange = 5;
                            newTask.extraInfo = _.sample(_.range(-2, -2 + numericRange))
                        } else if(taskType === "slider"){
                            newTask.extraInfo = _.sample(_.range(-1, -1 + numericRange))
                        } else{
                            newTask.extraInfo = _.sample(_.range(1, (numericRange + 1)));
                        }
                    }

                    // Callback to initialize timer once task is inside redis
                    const callback = function(panel){
                        let duration = _.random(30,39);
                        redisClient.json_get('playerSockets', sessionID, function(err, socketID){
                            if(err){
                                console.log(err)
                            } else{
                                socketID = socketID.toString().replace(new RegExp(/"/g), "")
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
            // Make this a generic new round function, since the process is the same for new rounds
            newRound(roomCode, sessionID, socket)
        })
        
        socket.use(function(packet, next){
            packet.push(sessionID);
            packet.push(socket);
            next()
        })

        socket.use(attachRoomCode)

        function validateInput(roomCode, sessionID, categoryInput, panelUID, socket){
            redisClient.json_get(roomCode, '.taskList.' + panelUID, function(err, value){
                if(err){
                    console.log(err)
                    console.log("Task is not valid")
                    // Give penalty here
                } else{
                    let task = JSON.parse(value)
                    categoryInput = (categoryInput === null) ? '' : categoryInput.toString()
                    task.extraInfo = task.extraInfo.toString()
                    if(task.takerSID === 'sid' + sessionID && task.extraInfo === categoryInput){
                        console.log("Task found and correct")
                        clearInterval(taskTimers[panelUID])
                        delete taskTimers[panelUID]
                        // Give reward, check if reward is enough to cross threshold
                        redisClient.json_numincrby(roomCode, '.progress', 1, function(err){
                            if(err){
                                console.log(err)
                            } else{
                                redisClient.json_get(roomCode, '.', function(err, roomInfo){
                                    if(err){
                                        console.log(err)
                                    } else{
                                        io.to(roomCode).emit('progress')
                                        roomInfo = JSON.parse(roomInfo)
                                        if(roomInfo.progress >= roomInfo.roomThreshold){
                                            const callback = function(){
                                                for(const panelUID of insertedTaskList){
                                                    clearInterval(taskTimers[panelUID])
                                                    delete taskTimers[panelUID]
                                                }
                                                newRound(roomCode, 'sid' + sessionID, socket)
                                            }
                                            let insertedTaskList = insertedTask[[roomCode]]
                                            io.to(roomCode).emit('threshold', roomInfo.roomThreshold + 2)
                                            redisHelper.resetProgress(roomCode, callback)
                                        } else{
                                            createTask(roomCode, task.giverSID)
                                        }
                                    }
                                })
                            }
                        })
                    }
                    else{
                        console.log("Task is not valid")
                        // Give penalty here
                    }
                }
            })
        }

        socket.on("binary", function(panelUID){
            let roomCode = socket.roomCode
            validateInput(roomCode, sessionID, '', panelUID, socket)
        })
        socket.on("numeric", function(numericInput, panelUID){
            let roomCode = socket.roomCode
            validateInput(roomCode, sessionID, numericInput, panelUID, socket)
        })
        socket.on("sequence", function(sequenceInput, panelUID){
            let roomCode = socket.roomCode
            sequenceInput = sequenceInput.join('')
            console.log(sequenceInput)
            validateInput(roomCode, sessionID, sequenceInput, panelUID, socket)
        })
        socket.on("string", function(stringInput, panelUID){
            let roomCode = socket.roomCode
            validateInput(roomCode, sessionID, stringInput, panelUID, socket)
        })
    })
}