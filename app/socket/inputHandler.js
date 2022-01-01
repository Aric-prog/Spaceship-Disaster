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

        socket.use(function(packet, next){
            packet.push(sessionID);
            packet.push(socket);
            next()
        })
        socket.use(attachRoomCode)

        function validateInput(roomCode, sessionID, categoryInput){
            redisClient.json_get(roomCode, '.taskList', function(err, value){
                if(err){
                    console.log(err)
                } else{
                    taskList = JSON.parse(value)
                    let rightWrong = true
                    console.log(taskList)
                    for (panel in taskList){
                        task = taskList[panel]
                        categoryInput = (categoryInput === null) ? '' : categoryInput
                        console.log(categoryInput + ': ' + typeof categoryInput)
                        task.extraInfo = task.extraInfo.toString()
                        if(task.takerSID === 'sidsid' + sessionID && task.extraInfo === categoryInput){
                            rightWrong = true
                            console.log("Task found and correct")
                            break
                        }
                        else{
                            rightWrong = false
                        }
                    }
                    if (!rightWrong){
                        console.log("Task is not valid")
                    }
                }
            })
        }

        socket.on("binary", function(binaryInput){
            let roomCode = socket.roomCode
            // redisClient.json_get(roomCode, '.taskList', function(err, value){
            //     if(err){
            //         console.log(err)
            //     } else{
            //         taskList = JSON.parse(value)
            //         let rightWrong = true
            //         console.log(taskList)
            //         for (panel in taskList){
            //             // console.log(panel)
            //             // console.log(taskList[panel])
            //             task = taskList[panel]
            //             binaryInput = (binaryInput === null) ? '' : binaryInput
            //             if(task.takerSID === 'sidsid' + sessionID && task.extraInfo === binaryInput){
            //                 rightWrong = true
            //                 console.log("Task found and correct")
            //                 break
            //             }
            //             else{
            //                 rightWrong = false
            //             }
            //         }
            //         if (!rightWrong){
            //             console.log("Task is not valid")
            //         }
            //     }
            // })
            validateInput(roomCode, sessionID, binaryInput)
        })
        socket.on("numeric", function(numericInput){
            let roomCode = socket.roomCode
            validateInput(roomCode, sessionID, numericInput)
        })
        socket.on("sequence", function(sequenceInput){
            let roomCode = socket.roomCode
            validateInput(roomCode, sessionID, sequenceInput)
        })
        socket.on("string", function(stringInput){
            let roomCode = socket.roomCode
            validateInput(roomCode, sessionID, stringInput)
        })
    })
}