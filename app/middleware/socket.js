const { customAlphabet } = require("nanoid");
const sharedsession = require("express-socket.io-session");
const { session, redisClient } = require("../redis.js")
const nanoid = customAlphabet("123456789ABCDEFGHIJKLMNOPRSTUVWXYZ", 6);
const Room = require('../room.js')

function initSocket(io) {
    io.use(sharedsession(session, {
        autoSave : true
    }));
    io.on("connection", function(socket){
        const session = socket.handshake.session;
        socket.on("createRoom", function(){
            // Creates an empty room and joins that, also couples their SID with the roomCode in redis
            var roomCode = nanoid();
            
            socket.join(roomCode);
            
            var test = new Room(roomCode, "team bruh");
            redisClient.json_set(roomCode, '.', JSON.stringify(test), function(err){
                if(err){
                    console.log(err)
                }
                else{
                    redisClient.expire(roomCode, 60 * 60 * 2);
                    io.to(roomCode).emit("roomCreated", roomCode);
                }
            });

            // Example get request
            // redisClient.json_get(roomCode, '.timer', function(err, value){
            //     if(err){console.log(err)}
            //     console.log(value)
            // })

        });
        socket.on("joinRoom", function(roomCode){
            // Check if roomcode exist in the server list
            socket.join(roomCode);
        });
        
        // Remove this taskSuccess to generalized input
        socket.on("taskSuccess", function(task){
            // Checks if this taskSuccess advances the room to nextround, if not, just checks the particular task out
            // Maybe task object is enum?
        });

        // Starts the game, argument may contain settings for the game
        socket.on("start", function(){
            // Checks if player emitting this has actually started or not, if game already started, deny request.
            // Note : maybe middleware implementation that checks if game started?

            // Creates an interval of x time that ticks down and broadcast to the room.
            
            timeInSec = 60;
            // Timer needs to be stored in room object of player
            // One room only need one timer for all of them.
            var timer = setInterval(function(){
                io.sockets.emit('timer', timeInSec);
                timeInSec--;
                if(timeInSec === 0){
                    clearInterval(timer);
                };
            }, 1000);
        })
    });
};
module.exports = initSocket;