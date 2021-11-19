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

        // Task contains data on :
        // - Name of the task itself
        // - Players assigned to the task
        // - Giver of the task (later to signal to them a task is indeed done)
        // - Additional info on task
        this.taskList = {};
    }
}

module.exports = Room;