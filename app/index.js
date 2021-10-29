const express = require('express');
const http = require('http');
const cors = require('cors');
const initSocket = require('./middleware/socket.js')

const { Server } = require("socket.io")

const app = express();
const httpServer = http.createServer(app);
const {redisClient, session} = require('./redis.js');
const routes = require('./controllers/routes.js');

app.use(cors())
const io = new Server(httpServer, {
    cors:{
        origin: "http://localhost:3000"
    }
})

io.use(function(socket, next){
    session(socket.request, socket.request.res, next)
})
app.use(session)
initSocket(io)
app.use('/', routes.client)
app.use('/api', routes.api)

const PORT = process.env.PORT || 3000
httpServer.listen(PORT)