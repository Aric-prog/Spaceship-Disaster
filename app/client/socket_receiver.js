let totalTaskDuration = 0;
let totalPlayer = 0;

const joinRoomButton = document.querySelector('#joinRoomButton')
const roomCodeInput = document.querySelector('#roomCodeInput')
const leftMenu = document.querySelector('#leftM')
const startButton = document.querySelector('.startButton')
const exitButton = document.querySelector('.exit-button')
const timer = document.querySelector('.timer')
socket.on("timer", function(timeInSec){
    $('.timer').html('Time : ' + String(timeInSec))
});
socket.on("taskTimer", function(taskTime){
    let progressPercentage = ((taskTime / totalTaskDuration) * 100) >> 0
    $('#taskTimer').css('width', String(progressPercentage) + '%')
    let green = ((progressPercentage / 100) * 255) >> 0
    let red = 255 - green
    let bgcArg = [red, green, 0]
    bgcArg.join(',')
    $('#taskTimer').css('background-color', 'rgb(' + bgcArg + ')')
})

socket.on('playerJoined', function(playerName){
    let captain = document.createElement('div')
    captain.classList.add('captains')
    captain.innerHTML = playerName
    leftMenu.appendChild(captain)
    totalPlayer += 1;
    
    setTimeout(function(){
        captain.classList.add('active')
        if(totalPlayer === 4){
            startButton.classList.add('active')
        }
    }, 1000)
    
})

socket.on("newRound", function(panelList, arrangement){
    const event = new CustomEvent('newRound', {detail : 
            {'panelList' : panelList, 'arrangement' : arrangement}
        }
    )
    leftMenu.dispatchEvent(event)
})

socket.on("newTask", function(taskString, duration){
    console.log('newTask')
    
    totalTaskDuration = duration
    $('#task').html(taskString)
})
socket.on("roomCreated", function(roomCode){
    $('#room').text('Room : ' + roomCode);
    alert("Succesfully joined room")
});
socket.on("error", function(err){
    alert(err)
})

socket.on("joinedGameRoom", function(nameList){
    let roomCode = roomCodeInput.value.toUpperCase()
    $('#room').text('Room : ' + roomCode);
    alert("Succesfully joined room")
    console.log(nameList)
    for(const nameIndex in nameList){
        let captain = document.createElement('div')
        captain.classList.add('captains')
        captain.innerHTML = nameList[nameIndex]
        leftMenu.appendChild(captain)
        totalPlayer += 1;
        setTimeout(function(){
            captain.classList.add('active')
            if(totalPlayer === 4){
                startButton.classList.add('active')
            }
        }, 1000)
    }
    let captain = document.createElement('div')
    captain.classList.add('captains')
    captain.innerHTML = $('#usernameInput').val()
    leftMenu.appendChild(captain)
    totalPlayer += 1;
    setTimeout(function(){
        if(totalPlayer === 4){
            startButton.classList.add('active')
        }
        captain.classList.add('active')
    }, 1000)
})
function createRoom(username){
    socket.emit("createRoom", username)
}
function joinRoom(roomCode, username){
    socket.emit("joinRoom", roomCode, username)
}
function start(){
    socket.emit("start")
}

exitButton.addEventListener('click', function(){
    
})  

startButton.addEventListener('click', function(){
    start()
})

joinRoomButton.addEventListener('click', function(){
    let roomCode = roomCodeInput.value.toUpperCase()
    let username = $('#usernameInput').val()
    if(username === '' || username === null){
        alert('Username not filled')
    } else{
        if(roomCode === '' || roomCode === null){
            createRoom(username)
        } else{
            joinRoom(roomCode, username)
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

// game.newRound(panels,[1,1,1,2,4],scene,camera)
arrow.addEventListener('click', extendMenu)