// Contains all the data needed for one player
class Player {
    constructor(sessionID, socketID, username){
        this.sessionID = sessionID;
        this.socketID = socketID;
        this.username = username;
    }
}

module.exports = Player;