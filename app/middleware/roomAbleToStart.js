const { redisClient } = require('../redis.js')
const redisHelper = require('../socket/redisHelper.js')
function roomAbleToStart(packet, next){
    const event = packet[0];
    const socket = packet[2];
    const roomCode = socket.roomCode;

    if(event === 'start'){
        // Remove all quotes
        
        redisClient.json_objlen(roomCode, '.playerInfo', function(err, playerCountInRoom){
            if(err){
                console.log(err)
                next(new Error('Redis error'))
            }
            else if(playerCountInRoom < 4){
                next(new Error('Not enough player in room'))
            }
            else if(playerCountInRoom == 4){
                redisClient.json_get(roomCode, '.', function(err, roomInfo){
                    if(JSON.parse(roomInfo)['started']){
                        next(new Error('Room already started'))
                    } else{
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