const { redisClient } = require('../redis.js')
const redisHelper = require('../socket/redisHelper.js')
function roomAbleToStart(packet, next){
    const event = packet[0];
    const sessionID = packet[1];
    const socket = packet[2];

    if(event === 'start'){
        redisClient.json_get('playerRooms', '.sid' + sessionID, function(err, roomCode){
            if(err){
                next(new Error('Room not found'))
            } 
            else{
                // Remove all quotes
                roomCode = roomCode.replace(/['"]+/g, "");
                socket.roomCode = roomCode;
                redisClient.json_objlen(roomCode, '.playerInfo', function(err, playerCountInRoom){
                    if(err){
                        next(new Error('Redis error'))
                    }
                    else if(playerCountInRoom < 4){
                        next(new Error('Not enough player in room'))
                    }
                    else if(playerCountInRoom == 4){
                        redisClient.json_get(roomCode, '.', function(err, roomInfo){
                            console.log(JSON.parse(roomInfo)['started'])
                            if(JSON.parse(roomInfo)['started']){
                                next(new Error('Room already started'))
                            } else{
                                next()
                            }
                        })
                    }
                })
            }
        })  
    } else{
        next()
    }
};

module.exports = roomAbleToStart;