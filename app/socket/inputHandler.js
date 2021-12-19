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
        socket.on("binary", function(){
            
        })
        socket.on("numeric", function(){
            
        })
        socket.on("sequence", function(sequence){
            
        })
        socket.on("string", function(string){

        })
    })
}