const express = require('express');
const http = require('http');
const cors = require('cors');
const initSocket = require('./middleware/socket.js')

const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
const { Server } = require("socket.io")

const app = express();
const RedisStore = connectRedis(session)
const httpServer = http.createServer(app);

const redisClient = redis.createClient({
    port : 6379,
    host : 'localhost'
})

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
app.use(session({
    store : new RedisStore({client : redisClient}),
    secret : 'catsAreGreat',
    saveUninitialized : false,
    resave : false,
    cookie : {
        secure : false,
        httpOnly : true,
        maxAge : 1000 * 60 * 60 * 48
    }
}))

app.use('/api', routes.api)
app.use('/', routes.client)

httpServer.listen(PORT)