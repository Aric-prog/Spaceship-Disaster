const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("123456789ABCDEFGHIJKLMNOPRSTUVWXYZ", 6);
const Room = require('../room.js')
const redisHelper = require("./redisHelper.js")
const { redisClient } = require("../redis.js");
const Player = require("../player.js");

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
            var roomCreator = new Player(sessionID, socket.id, session.playerName);

            redisClient.json_set(roomCode, '.', JSON.stringify(room), function(err){
                if(err){
                    console.log(err);
                }
                else{
                    redisClient.expire(roomCode, 60 * 60 * 2);
                    redisHelper.addPlayerToRoom(io, roomCode, roomCreator, socket);
                    io.to(roomCode).emit("roomCreated", roomCode);
                };
            });
            
        });
        socket.on("joinRoom", function(roomCode){
            // Check if roomcode exist in the server list
            var joiningPlayer = new Player(sessionID, socket.id, session.playerName);
            redisClient.json_objlen(roomCode, '.playerInfo', function(err, value){
                console.log(value);
                if(err){
                    console.log(err);
                    io.to(socket.id).emit("error", "Room does not exist");
                } else if(value >= 4){
                    io.to(socket.id).emit("error", "Cannot join a full room.");
                } else{
                    console.log(sessionID);
                    redisHelper.addPlayerToRoom(io, roomCode, joiningPlayer, socket);
                };
            });

            redisClient.json_get(roomCode, '.playerInfo', function(err,value){
                console.log(value)
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
            
            redisHelper.getPlayerRoom(sessionID)
            
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