const sharedsession = require("express-socket.io-session");
const { session } = require("../redis.js")

function initSocket(io) {
    io.use(sharedsession(session, {
        autoSave : true
    }));
    const inputHandler = require("../socket/inputHandler.js")(io)
    const roomHandler = require("../socket/roomHandler.js")(io)  
};
module.exports = initSocket;