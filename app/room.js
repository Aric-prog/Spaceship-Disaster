// Contains all the data needed for one room
class Room {
    constructor(roomCode, roomThreshold){
        this.roomCode = roomCode;
        this.rounds = 1;
        
        this.progress = 0;
        this.roomThreshold = roomThreshold;
        // Contains relevant data on all players inside the room
        // Players are identified by their session ID.
        
        this.playerInfo = {};// session ID and panel info
        

        this.timer = 90;

        // Task contains data on :
        // - Name of the task itself
        // - Players assigned to the task
        // - Giver of the task (later to signal to them a task is indeed done)
        // - Additional info on task
        this.taskList = {};
        this.started = false;
    }
}

module.exports = Room;