const redis = require('redis');
const expressSession = require('express-session');
const connectRedis = require('connect-redis');

const RedisStore = connectRedis(expressSession)

const redisClient = redis.createClient({
    port : 6379,
    host : 'localhost'
})

const session = expressSession({
    store : new RedisStore({client : redisClient}),
    secret : 'catsAreGreat',
    saveUninitialized : true,
    resave : true,
    cookie : {
        secure : false,
        httpOnly : true,
        maxAge : 1000 * 60 * 60 * 1
    }
})

module.exports = {
    redisClient,
    session
}