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