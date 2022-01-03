let totalTaskDuration = 0;
let totalPlayer = 1;
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

socket.on('playerJoined', function(){
    
})

socket.on("newTask", function(taskString, duration){
    console.log('newTask')
    
    totalTaskDuration = duration
    $('#task').html(taskString)
})
socket.on("roomCreated", function(roomCode){
    $('#room').text(roomCode);
});
socket.on("joinSuccess", function(){
    alert("succesfully joined room")
})
function createRoom(username){
    socket.emit("createRoom", username)
}
function joinRoom(roomCode){
    socket.emit("joinRoom", roomCode, username)
}
function start(){
    socket.emit("start")
}

const joinRoomButton = document.querySelector('#joinRoomButton')
const usernameInput = document.querySelector('#usernameInput')
const roomCodeInput = document.querySelector('#roomCodeInput')


joinRoomButton.addEventListener('click', function(){
    let roomCode = roomCodeInput.value
    let username = usernameInput.value
    if(username === '' || username === null){
        alert('Username form not filled')
    } else{
        if(roomCode === '' || roomCode === null){
            createRoom(username)
        } else{
            joinRoom(username, roomCode)
        }
    }
})

const arrow = document.querySelector('#arrow')
const rightMenu = document.querySelector('.rightMenu')
const extendMenu = function(){
    if(arrow.classList.contains('active')){
        arrow.classList.remove('active')
        rightMenu.classList.remove('active')
    } else{
        arrow.classList.add('active')
        rightMenu.classList.add('active')
    }
}

arrow.addEventListener('click', extendMenu)
// game.newRound(panels,[1,1,1,2,4],scene,camera)