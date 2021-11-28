const { redisClient } = require('../redis.js')
function roomAbleToStart(packet, next){
    const event = packet[0];
    const sessionID = packet[1];
    const socket = packet[2];

    
    if(event === 'start'){
        redisClient.json_get('playerRooms', '.sid' + sessionID, function(err, roomCode){
            if(err){
                console.log(err);
                err.playerRoomNotFound = true;
                next(err)
            } 
            else{
                // Remove all quotes
                roomCode = roomCode.replace(/['"]+/g, "");
                socket.roomCode = roomCode;
                redisClient.json_objlen(roomCode, '.playerInfo', function(err, playerCountInRoom){
                    if(err){
                        console.log(err);
                        err.notEnoughPlayers = true;
                        next(err)
                    } 
                    else if(playerCountInRoom == 4){
                        next()
                    }
                })
            }
        })  
    } else{
        next()
    }
};

module.exports = roomAbleToStart;