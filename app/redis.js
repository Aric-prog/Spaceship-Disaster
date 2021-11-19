const redis = require('redis');
const expressSession = require('express-session');
const connectRedis = require('connect-redis');
const rejson = require('redis-rejson')
const config = require('./config.js');

const RedisStore = connectRedis(expressSession)

rejson(redis)
const redisClient = redis.createClient({
    host : config.redis.host,
    port : config.redis.port,
    auth_pass : config.redis.auth
});

redisClient.on('error', function(err){
    console.error('Redis error : ', err);
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
});

module.exports = {
    redisClient,
    session
};