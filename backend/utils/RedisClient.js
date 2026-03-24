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
    try {
      return await redis.get(key);
    } catch (err) {
      console.error("Redis GET error:", err.message);
      return null;
    }
  },

  async setEx(key, ttlSeconds, value) {
    if (!value || ttlSeconds <= 0) return;
    try {
      await redis.set(key, value, { EX: ttlSeconds });
    } catch (err) {
      console.error("Redis SETEX error:", err.message);
    }
  },
};