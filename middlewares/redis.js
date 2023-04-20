const Redis = require("ioredis");
require('dotenv').config();

const redis = new Redis({
    host: process.env.REDIS_DOCKER || "localhost",
    port: 6379
});

module.exports = redis;