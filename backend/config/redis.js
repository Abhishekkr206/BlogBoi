const redis = require("redis")

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const client = redis.createClient({
    socket:{
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    username: 'default',
    password: REDIS_PASSWORD
})

client.on('error', (err) => console.log('Redis Error:', err));
client.on('connect', () => console.log('Redis Connected'));

(async () => {
  await client.connect();
})();

module.exports = client;