const { nanoid } = require('nanoid');
const redisHelper = require('./redisHelper.js')
const { redisClient } = require('../redis.js')
const roomAbleToStart = require('../middleware/roomAbleToStart.js')
const _ = require('lodash');

const inputInfo = require("./inputInfo.js");

const Task = require("../task.js");
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

    function createTask(roomCode, sessionID, socket){
        redisClient.json_get(roomCode, 'playerInfo', function(err, playerInfo){
            if(err){
                console.log(err);
            } else{
                // When generating tasks, make sure that the task is unique to the panel
                playerInfo = JSON.parse(playerInfo);

                delete playerInfo['sid' + sessionID]
                let giverSID = _.sample(Object.keys(playerInfo));
                let panelUID = _.sample(Object.keys(playerInfo[giverSID]['panelList']));
                let randomPanel = playerInfo[giverSID]['panelList'][panelUID]
                
                let taskName = randomPanel.name;
                let taskType = inputInfo.indexTopanelType[randomPanel.typeIndex]
                let taskCategory = randomPanel.category;
                
                // TODO : How to identify panel using task UID??
                // Approach 1 : find a way to do above
                // Approach 2 : screw it, each panel can only have one task
                
                let newTask = new Task(taskName, giverSID, 'sid' + sessionID, 1, panelUID);
                
                if(taskCategory === "string"){
                    let stringRange = inputInfo.stringRange[taskName];
                    newTask.extraInfo = _.shuffle(_.range(1, stringRange + 1)).toString().replace(new RegExp(/,/g), "");
                } else if(taskCategory === "numeric") {
                    let numericRange = inputInfo.numericRange[taskName];
                    // Don't forget to check if input type is toggle, ask yowen at what size does the input size becomes larger as well
                    if(taskType === "slider" && randomPanel.size >= 2){
                        numericRange = 5;
                    }
                    newTask.extraInfo = _.sample(_.range(1, (numericRange + 1)));
                }

                // Callback to initialize timer once task is inside redis
                const callback = function(){
                    let duration = 10;
                    taskTimers[panelUID] = setInterval(function(){
                        duration -= 1;
                        if(duration <= 0){
                            // do penalty here to roomtimer
                            // Emit penalty effect to client
                            clearInterval(taskTimers[panelUID])
                            delete taskTimers[panelUID]
                        }
                        // For each second emit to a particular socket.id
                    }, 1000)
                    io.to(socket.id).emit('taskTimer', duration)
                };
                redisHelper.addTask(roomCode, {panelUID : newTask}, callback);
            }
        })
    };
    
    function createPanelForRoom(roomCode, callback = function(){}){
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
                        let category = inputInfo.typeToGeneric[type];
                        let name = _.sample(firstNamePool) + _.sample(secondNamePool);
                        
                        let panelID = nanoid();
                        let newPanel = new Panel(name, panelTypeIndex, category, size);
                        
                        panelList[panelID] = newPanel;
                    }
                    redisHelper.addPanelList(roomCode, sid, panelList, arrangement, callback);
                };   
            }
        });
    };

    function newRound(roomCode, sessionID, socket){
        const callback = function(){
            createTask(roomCode, sessionID, socket)
        }
        createPanelForRoom(roomCode, callback);
    }

    io.on('connection', function(socket){
        const sessionID = socket.handshake.sessionID;
        socket.use(roomAbleToStart)
        socket.on('start', function(){
            // Generate panel distribution amount of 4,5,5,6
            let roomCode = socket.roomCode;
            // Make this a generic new round function, since the process is the same for new rounds
            newRound(roomCode, sessionID, socket)
        })
        socket.on('test', function(){
            // Test function for literally anything
        })
    })
}