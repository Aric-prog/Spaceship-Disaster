// Contains all the data needed for one room
class Room {
    constructor(sessionID, socketID){
        this.sessionID = sessionID;
        this.socketID = socketID;
    }
}

module.exports = Room;