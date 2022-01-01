const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("123456789ABCDEFGHIJKLMNOPRSTUVWXYZ", 6);
const redisHelper = require("./redisHelper.js")
const { redisClient } = require("../redis.js");
const roomAbleToStart = require("../middleware/roomAbleToStart.js");

const Room = require('../room.js')
const Player = require("../player.js");
const {mainTimers, durationOfRooms} = require("./roomTimerVars.js");
const attachRoomCode = require("../middleware/attachRoomCode.js");

module.exports = function(io){
    // Initialize empty room variable that stores which room the player is in.
    redisClient.json_set('playerRooms', '.', JSON.stringify({}));
    redisClient.json_set('playerSockets', '.', JSON.stringify({}));

    io.on("connection", function(socket){
        const session = socket.handshake.session;
        const sessionID = socket.handshake.sessionID;
        console.log(sessionID)
        redisClient.json_set('playerSockets', '.sid' + sessionID, '\"' + socket.id + '\"', function(err){
            if(err){
                console.log(err)
            };
        })

        socket.on("createRoom", function(teamName){
            // Creates an empty room and joins that, also couples their SID with the roomCode in redis
            let roomCode = nanoid();
            
            session.playerName = "unknown";
            socket.join(roomCode);
            let room = new Room(roomCode, teamName);
            let roomCreator = new Player(sessionID, socket.id, session.playerName);

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
            let joiningPlayer = new Player(sessionID, socket.id, session.playerName);
            redisClient.json_objlen(roomCode, '.playerInfo', function(err, playerCountInRoom){
                console.log(playerCountInRoom);
                console.log(err);
                if(err || playerCountInRoom === null){
                    io.to(socket.id).emit("error", "Room does not exist");
                } else if(playerCountInRoom >= 4){
                    io.to(socket.id).emit("error", "Cannot join a full room.");
                } else{
                    redisHelper.addPlayerToRoom(io, roomCode, joiningPlayer, socket);
                };
            });
        });

        socket.on("disconnecting", function(){
            let rooms = Object.keys(socket.rooms);
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

        // Adds some data on the packet for later use
        socket.use(function(packet, next){
            packet.push(sessionID);
            packet.push(socket);
            next()
        })
        socket.use(attachRoomCode)
        socket.use(roomAbleToStart)
        // Starts the game, argument may contain settings for the game
        socket.on("start", function(){
            // Checks if player emitting this has actually started or not, if game already started, deny request.
            // Note : maybe middleware implementation that checks if game started?

            // Creates an interval of x time that ticks down and broadcast to the room.
            
            // Timer needs to be stored in room object of player
            // One room only need one timer for all of them.

            let roomCode = socket.roomCode;
            // Room start initialize here
            // Generate lists of tasks here
            io.to(roomCode).emit('start');
            redisHelper.setRoomStartedFlag(roomCode)
            durationOfRooms[roomCode] = 60
            // TODO : Remember the time in the rooms, to be used later for penalties when they fuck up
            const mainTimer = setInterval(function(){
                durationOfRooms[roomCode] -= 1;
                if(durationOfRooms[roomCode] <= 0){
                    // Room is die when this happens, don't forget to clear room and stuff here
                    io.to(roomCode).emit('gameOver');
                    redisHelper.endRoom(sessionID);
                    clearInterval(mainTimer);
                }
                io.to(roomCode).emit('timer', durationOfRooms[roomCode]);
            }, 1000)
            mainTimers[roomCode] = mainTimer;
        })

        socket.on("error", function(err){
            io.to(socket.id).emit('error', String(err))
        })
    })   
}