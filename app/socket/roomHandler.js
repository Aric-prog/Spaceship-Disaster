const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("123456789ABCDEFGHIJKLMNOPRSTUVWXYZ", 6);
const Room = require('../room.js')
const redisHelper = require("./redisHelper.js")
const { redisClient } = require("../redis.js");
const Player = require("../player.js");
const PlayerRoomPairing = require("../playerRoomPairing.js");

module.exports = function(io){
    // Initialize empty room variable that stores which room the player is in.
    redisClient.json_set('playerRooms', '.', JSON.stringify({}));

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
            redisClient.json_objlen(roomCode, '.playerInfo', function(err, playerCountInRoom){
                console.log(playerCountInRoom);
                if(err){
                    console.log(err);
                    io.to(socket.id).emit("error", "Room does not exist");
                } else if(playerCountInRoom >= 4){
                    io.to(socket.id).emit("error", "Cannot join a full room.");
                } else{
                    console.log(sessionID);
                    redisHelper.addPlayerToRoom(io, roomCode, joiningPlayer, socket);
                };
            });
        });

        // Starts the game, argument may contain settings for the game
        socket.on("start", function(){
            // Checks if player emitting this has actually started or not, if game already started, deny request.
            // Note : maybe middleware implementation that checks if game started?

            // Creates an interval of x time that ticks down and broadcast to the room.
            
            // Timer needs to be stored in room object of player
            // One room only need one timer for all of them.
            redisClient.json_get('playerRooms', '.sid' + sessionID, function(err, roomCode){
                if(err){console.log(err);} 
                else{
                    // Remove all quotes
                    roomCode = roomCode.replace(/['"]+/g, "");
                    redisClient.json_objlen(roomCode, '.playerInfo', function(err, playerCountInRoom){
                        console.log(playerCountInRoom)
                        if(err){console.log(err);} 
                        else if(playerCountInRoom == 4){
                            io.to(roomCode).emit('start')
                            var timeInSec = 60;
                            const mainTimer = setInterval(function(){
                                io.to(roomCode).emit('timer', timeInSec);
                                timeInSec -= 1;
                                if(timeInSec <= 0){
                                    clearInterval(mainTimer);
                                }
                            }, 1000)
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
            redisClient.json_set('playerRooms', '.', JSON.stringify({}));
        })
    })   
}