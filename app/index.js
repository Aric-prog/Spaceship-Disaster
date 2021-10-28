const express = require('express');
const http = require('http');
const cors = require('cors');
const initSocket = require('./middleware/socket.js')

const { Server } = require("socket.io")

const app = express();
const redis = require('./redis.js');
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors:{
        origin: "http://localhost:3000",
        methods: ["GET","POST"],
    }
})

initSocket(io)
const PORT = process.env.PORT || 3000
const routes = require('./controllers/routes.js')

// Session settings
app.use(redis.redisSession)
app.use('/api', routes.api)
app.use('/', routes.client)

httpServer.listen(PORT)