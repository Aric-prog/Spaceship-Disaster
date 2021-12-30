const attachRoomCode = require("../middleware/attachRoomCode.js");
const { redisClient } = require("../redis.js")
const redisHelper = require("./redisHelper.js")

// TODO : Validate input and get tasks from redis
// On correct input, server should remove from redis cloud, and add progress to room
// If false, give penalty to room by reducing timer (make sure to keep track of this timer)

module.exports = function(io){
    // Inputs are divided into
    // - Binary (push x button)
    // - Numeric (slide funky bar to 3)
    // - Sequence (press in this order)
    // - String (full string inputs like keypad)



    io.on("connection", function(socket){
        const session = socket.handshake.session; 
        const sessionID = socket.handshake.sessionID;   

        // const checkRightSID = function(callback){
        //     redisClient.json_set(function(err){
        //         // The whole verify process is here
        //         callback(additionalInfo)
        //     })
        // }

        socket.use(attachRoomCode)
        socket.on("binary", function(){
            // 1. You need to query session id to get the player room
            // 2. YOu need to check the task inside the room itself
        })
        socket.on("numeric", function(){
            
        })
        socket.on("sequence", function(sequence){
            
        })
        socket.on("string", function(string){

        })
    })
}