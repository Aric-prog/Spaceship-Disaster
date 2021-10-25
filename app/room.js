// Contains all the data needed for one room

class Room {
    constructor(roomCode, teamName){
        this.roomCode = roomCode;
        this.rounds = 1;
        
        this.teamName = teamName;
        this.playerUID = [];
        this.lives = 3;

        this.timer = 0
    }
}