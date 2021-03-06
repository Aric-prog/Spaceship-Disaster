const express = require('express');
const http = require('http');
const cors = require('cors');
const initSocket = require('./middleware/socket.js')
const path = require('path')


const { Server } = require("socket.io")

const app = express();
const httpServer = http.createServer(app);
const { session } = require('./redis.js');
const routes = require('./controllers/routes.js');

app.use(cors())
const io = new Server(httpServer, {
    cors:{
        origin: "http://sigma.jasoncoding.com:3000"
    }
})

app.use(session)
initSocket(io)
app.use(express.static(path.join(__dirname, 'client')))
app.use('/', routes.client)
app.use('/api', routes.api)

const PORT = process.env.PORT || 3000
httpServer.listen(PORT)