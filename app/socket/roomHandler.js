const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("123456789ABCDEFGHIJKLMNOPRSTUVWXYZ", 6);
const Room = require('../room.js')
const { redisClient } = require("../redis.js")

module.exports = function(io){
    io.on("connection", function(socket){
        const session = socket.handshake.session;
        const sessionID = socket.handshake.sessionID;
        socket.on("createRoom", function(teamName){
            // Creates an empty room and joins that, also couples their SID with the roomCode in redis
            console.log(sessionID)
            if(!session.roomCode){
                var roomCode = nanoid();
                session.roomCode = roomCode;

                
                socket.join(roomCode);
                var test = new Room(roomCode, teamName);
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
            }
        });
        socket.on("joinRoom", function(roomCode){
            // Check if roomcode exist in the server list
            if(session.roomCode){
                socket.join(roomCode);
                redisClient.json_arrlen(roomCode, '.playerUID', function(err, value){
                    if(err){
                        console.log(err);
                    } else if(value >= 4){
                        io.to(socket.id).emit("error", "Cannot join a full room.")
                    };
                })
            }
            // redisClient.json_set(roomCode, '.roomCode', "\"Rardo\"", function(err){
            // if(err){console.log(err);}; 
            // })
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
            
            // Timer needs to be stored in room object of player
            // One room only need one timer for all of them.
            redisClient.json_get(session.roomCode, '.roomCode', function(err){
                if(err){
                    console.log(err);
                } else{
                    timeInSec = 60;
                    redisClient.json_set(session.roomCode, '.timer', timeInSec, function(err){
                        if(err){console.log(err);};
                    })
                    var timer = setInterval(function(){
                        io.to(session.roomCode).emit('timer', timeInSec);
                        timeInSec--;
                        if(timeInSec === 0){
                            clearInterval(timer);
                        };
                    }, 1000);
                }
            })
        })

        socket.on("disconnecting", function(){
            var rooms = Object.keys(socket.rooms);
            rooms.forEach(function(roomCode){
                socket.to(roomCode).emit("otherCaptainDisconnect")
            });
        })

        // Very bad feature, only use for testing environment
        socket.on("reset", function(){
            redisClient.flushall();
            session.roomCode = "";
        })
    })   
}