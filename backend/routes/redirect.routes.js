const express = require("express");
const redisClient = require("../utils/RedisClient");
const { getUrl, incrementClick } = require("../services/urlService");

const redirectRouter = express.Router();

redirectRouter.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // 1. Check Redis cache first
    const cachedUrl = await redisClient.get(shortCode);

    if (cachedUrl) {
      res.redirect(cachedUrl);
      console.log("redis hit");
      setImmediate(() => incrementClick(shortCode));
      return;
    }

    // 2. Fall back to DynamoDB
    const url = await getUrl(shortCode);

    if (!url) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    if (url.expiresAt && url.expiresAt <= Date.now()) {
      return res.status(410).json({ message: "Short URL has expired" });
    }

    // Redirect the user
    res.redirect(url.longURL);

    // Cache and increment click in the background
    setImmediate(() => {
      const ttlSeconds = url.expiresAt
        ? Math.floor((url.expiresAt - Date.now()) / 1000)
        : 3600;

      if (ttlSeconds > 0) {
        redisClient.setEx(shortCode, ttlSeconds, url.longURL);
      }

      incrementClick(shortCode);
    });
  } catch (err) {
    console.error("GET /:shortCode error:", err);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

module.exports = redirectRouter;
