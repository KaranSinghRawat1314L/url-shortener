const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
  },
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

(async () => {
  if (!redis.isOpen) await redis.connect();
})();

module.exports = {
  async get(key) {
  if (!redis.isReady) return null;

  try {
    
    const ans = await redis.get(key);
    console.log("Really redis hit");
    return ans;
  } catch (err) {
    console.error(err);
    return null;
  }
},

  async setEx(key, ttl, value) {
  if (!redis.isReady) return;

  try {
    await redis.set(key, value, { EX: ttl });
  } catch (err) {
    console.error(err);
  }
},
};
