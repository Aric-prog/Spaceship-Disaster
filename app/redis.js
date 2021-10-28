const redis = require('redis');
const session = require('express-session');
const connectRedis = require('connect-redis');

const RedisStore = connectRedis(session)

const redisClient = redis.createClient({
    port : 6379,
    host : 'localhost'
})

const redisSession = session({
    store : new RedisStore({client : redisClient}),
    secret : 'catsAreGreat',
    saveUninitialized : false,
    resave : false,
    cookie : {
        secure : false,
        httpOnly : true,
        maxAge : 1000 * 60 * 60 * 48
    }
})

module.exports = {
    redisClient,
    redisSession
}