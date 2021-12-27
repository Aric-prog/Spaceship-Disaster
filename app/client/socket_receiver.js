let totalTaskDuration = 0;
socket.on("timer", function(timeInSec){
    $('timer').html('Time : '+ String(timeInSec))
});
socket.on("taskTimer", function(taskTime){
    console.log('#taskTimer')
    let progressPercentage = ((taskTime / totalTaskDuration) * 100) >> 0
    $('#taskTimer').css('width', String(progressPercentage) + '%')
    let green = ((progressPercentage / 100) * 255) >> 0
    let red = 255 - green
    let bgcArg = [red, green, 0]
    bgcArg.join(',')
    $('#taskTimer').css('background-color', 'rgb(' + bgcArg + ')')
})
socket.on("newTask", function(taskString, duration){
    console.log('newTask')
    
    totalTaskDuration = duration
    $('#task').html(taskString)
})
socket.on("roomCreated", function(roomCode){
    console.log( 'Room : ' + roomCode)
    // $('#roomCode').text(roomCode);
});
socket.on("joinSuccess", function(){
    alert("succesfully joined room")
})
function createRoom(){
    socket.emit("createRoom")
}
function joinRoom(arg){
    socket.emit("joinRoom", arg)
}
function start(){
    socket.emit("start")
}