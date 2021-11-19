// Class will contain information about several things
// - Giver of the task, this will be reflected on the front-end of a particular user
// - Taker of the task, only this user will be able to execute the task. Used to verify if it's the right user doing the task
//   and not a fake emit from client
// - Name of the task so we can reuse the same panel with them still being unique.
class Task {
    constructor(taskName, giverSID, takerSID){
        this.taskName = taskName;
        this.giverSID = giverSID;
        this.takerSID = takerSID;
    }
}