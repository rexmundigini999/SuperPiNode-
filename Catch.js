const redis = require('redis');
const client = redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });

client.on('error', (err) => {
  console.log('Error connecting to Redis:', err);
});

// Function to set cache
const setCache = (key, value, ttl = 3600) => {
  client.setex(key, ttl, JSON.stringify(value), (err) => {
    if (err) console.log('Error setting cache:', err);
  });
};

// Function to get cache
const getCache = (key, callback) => {
  client.get(key, (err, data) => {
    if (err) console.log('Error getting cache:', err);
    callback(JSON.parse(data));
  });
};

module.exports = { setCache, getCache };
