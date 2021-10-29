const { client } = require("../controllers/routes");
const { nanoid } = require("nanoid");
function initSocket(io) {
    io.on("connection", function(socket){
        const session = socket.request.session;
        socket.on("createRoom", function(callback){
            // Creates an empty room and joins that, also couples their SID with the roomCode in redis
            var roomCode = "randomRoomCode";
            
            console.log(socket.request.session);
            socket.join(roomCode);
            // io.to(roomCode).emit("roomCreated", session.SID);
        });
        socket.on("joinRoom", function(roomCode){
            // Check if roomcode exist in the server list
            socket.join(roomCode)
        });
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
                }
            }, 1000)
        })
    });
};
module.exports = initSocket;