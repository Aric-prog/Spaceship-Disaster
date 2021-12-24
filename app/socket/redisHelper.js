const { redisClient } = require("../redis.js");

function addPlayerToRoom(io, roomCode, player, socket){
    const sessionID = socket.handshake.sessionID;
    redisClient.json_set(roomCode, '.playerInfo.sid' + sessionID, JSON.stringify(player), function(err){
        if(err){console.log(err)}
        else{                   
            redisClient.json_set('playerRooms', '.sid' + sessionID, '\"' + roomCode + '\"', function(err){
                if(err){
                    console.log(err);
                }
                redisClient.json_get('playerRooms', '.', function(err, val){console.log(val)})
            });
            socket.join(roomCode);
            io.to(socket.id).emit("joinSuccess");
        };
    });
}

function setRoomStartedFlag(roomCode){
    redisClient.json_set(roomCode, '.started', true, function(err){
        if(err){
            console.log(err);
        } else{
            
        }
    })
}

function getPlayerRoom(sessionID){
    redisClient.json_get('playerRooms', '.sid' + sessionID, function(err, value){
        if(err){
            console.log(err);
        } else{
            return roomCode;
        }
    })
}

function addPanelList(roomCode, sessionID, panelList, arrangement){
    redisClient.json_set(roomCode, '.playerInfo.' + sessionID + '.panelList', JSON.stringify(panelList), function(err){
        if(err){
            console.log(err);
        } else{

        }
    });
    redisClient.json_set(roomCode, '.playerInfo.' + sessionID + '.panelArrangement', JSON.stringify(arrangement), function(err){
        if(err){
            console.log(err);
        } else{
            
        }
    })
}

function addTask(roomCode, task, callback){
    redisClient.json_set(roomCode, '.taskList', JSON.stringify(task), function(err){
        if(err){
            console.log(err);
        } else{
            callback();
        }
    })
}

function endRoom(sessionID){
    // Get client room here and posts relevant data on database
}



module.exports = {addPlayerToRoom, getPlayerRoom, endRoom, addPanelList, addTask, setRoomStartedFlag}