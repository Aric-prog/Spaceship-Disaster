const { redisClient } = require('../redis.js')
function attachRoomCode(packet, next){
    const event = packet[0];
    const sessionID = packet[packet.length - 2];
    const socket = packet[packet.length - 1];
    
    if(event === 'start' ||
     event === 'binary' ||
     event === 'sequence' ||
     event === 'numeric' ||
     event === 'string'
     ){
        redisClient.json_get('playerRooms', '.sid' + sessionID, function(err, roomCode){
            if(err){
                console.log(err)
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