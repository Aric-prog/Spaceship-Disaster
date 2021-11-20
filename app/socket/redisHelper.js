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

function getPlayerRoom(sessionID){
    redisClient.json_get('playerRooms', '.sid' + sessionID, function(err, value){
        if(err){
            console.log(err);
        } else{
            return roomCode;
        }
    })
}

module.exports = {addPlayerToRoom, getPlayerRoom}