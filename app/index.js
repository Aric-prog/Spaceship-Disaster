const express = require('express');
const http = require('http');
const cors = require('cors');
const initSocket = require('./middleware/socket.js')

const { Server } = require("socket.io")
const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {})

initSocket(io)
const PORT = process.env.PORT || 3000

const routes = require('./api/routes.js')

app.use('/api', routes.api)

httpServer.listen(PORT)