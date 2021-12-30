const { redisClient } = require('../redis.js')
function attachRoomCode(packet, next){
    const event = packet[0];
    const sessionID = packet[1];
    const socket = packet[2];
    
    if(event === 'start' ||
     event === 'binary' ||
     event === 'sequence' ||
     event === 'numeric' ||
     event === 'string'
     ){
        redisClient.json_get('playerRooms', '.sid' + sessionID, function(err, roomCode){
            if(err){
                next(new Error('Could not find player room'))
            } else{
                roomCode = roomCode.replace(/['"]+/g, "")
                socket.roomCode = roomCode
                next()
            }
        })
    } else{
        next()
    }
};

module.exports = attachRoomCode;