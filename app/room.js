// Contains all the data needed for one room
class Room {
    constructor(roomCode, teamName){
        this.roomCode = roomCode;
        this.rounds = 1;
        
        this.teamName = teamName;
        
        // Structure of player UID will be SessionID : SocketID
        // SocketID will later be used to give task to specific user 
        this.playerUID = [];
        this.lives = 3;

        this.timer = 90;

        // Divide this into several objects for rounds ex : [{ <round 1 task data> },{ <round 2 task data> }]
        // On one round end add timer
        this.taskList = [];
    }
}

module.exports = Room;