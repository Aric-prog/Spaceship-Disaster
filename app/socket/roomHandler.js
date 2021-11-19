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
            var roomCode = nanoid();
            
            session.playerName = "unknown";
            socket.join(roomCode);
            var room = new Room(roomCode, teamName);
            room.playerUID[[sessionID]] = socket.id;
            redisClient.json_set(roomCode, '.', JSON.stringify(room), function(err){
                if(err){
                    console.log(err)
                }
                else{
                    redisClient.expire(roomCode, 60 * 60 * 2);
                    io.to(roomCode).emit("roomCreated", roomCode);
                }
            });
            redisClient.set(sessionID, roomCode)
            // Example get request
            // redisClient.json_get(roomCode, '.timer', function(err, value){
            //     if(err){console.log(err)}
            //     console.log(value)
            // })
        });
        socket.on("joinRoom", function(roomCode){
            // Check if roomcode exist in the server list
            redisClient.json_objlen(roomCode, '.playerUID', function(err, value){
                console.log(value)
                if(err){
                    console.log(err);
                    io.to(socket.id).emit("error", "Room does not exist")
                } else if(value >= 4){
                    io.to(socket.id).emit("error", "Cannot join a full room.")
                } else{
                    redisClient.set(sessionID, roomCode);
                    redisClient.json_arrappend(roomCode, '.playerUID', '\"' + socket.id + '\"', function(err){
                        if(err){console.log(err)}
                        else{                        
                            socket.join(roomCode);
                            io.to(socket.id).emit("joinSuccess")
                        }
                    })
                };
            })
        });

        // TODO : Rethink this function
        // socket.on("reconnect", function(){
        //     redisClient.json_get(session.roomCode, '.playerUID', function(err, value){
        //         if(value === sessionID){
        //             // Checks if reconnecting player is actually already in the room before.
        //             socket.join(session.roomCode)
        //         } else{
        //             io.to(socket.id).emit("error", "Failed to reconnect");
        //         }
        //     })
        // })

        // Starts the game, argument may contain settings for the game
        socket.on("start", function(){
            // Checks if player emitting this has actually started or not, if game already started, deny request.
            // Note : maybe middleware implementation that checks if game started?

            // Creates an interval of x time that ticks down and broadcast to the room.
            
            // Timer needs to be stored in room object of player
            // One room only need one timer for all of them.
            
            redisClient.get(sessionID, function(err, value){
                if(err){console.log(err)}
                else{
                    redisClient.json_objlen(value, '.playerUID', function(err, value){
                        if(err){console.log(err)}
                        else{

                        }
                    })
                }
            })
            
        })

        socket.on("disconnecting", function(){
            var rooms = Object.keys(socket.rooms);
            rooms.forEach(function(roomCode){
                socket.to(roomCode).emit("otherCaptainDisconnect")
            });
        })

        socket.on("disconnect", function(){
            // Tell redis to set a value in disconnected player
        })

        // Very bad feature, only use for testing environment
        socket.on("reset", function(){
            redisClient.flushall();
            session.roomCode = "";
        })
    })   
}