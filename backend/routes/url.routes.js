const express = require("express");
const generateShortCode = require("../utils/GenerateCode");
const { createUrl } = require("../services/urlService");

const urlRouter = express.Router();

urlRouter.post("/shortener", async (req, res) => {
  try {
    const { longURL, expiresIn } = req.body;

    if (!longURL) {
      return res.status(400).json({ message: "longURL is required" });
    }

    // Validate URL format and protocol
    let parsed;
    try {
      parsed = new URL(longURL);
    } catch {
      return res.status(400).json({ message: "Invalid URL" });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res
        .status(400)
        .json({ message: "Only http and https URLs are allowed" });
    }

    // Attempt to generate a unique short code (collision retry with cap)
    let shortCode;
    let created = false;
    const MAX_RETRIES = 5;
    let attempts = 0;

    while (!created) {
      if (attempts >= MAX_RETRIES) {
        return res
          .status(500)
          .json({ message: "Failed to generate a unique short code" });
      }

      attempts++;

      try {
        shortCode = generateShortCode();
        await createUrl({ shortCode, longURL, expiresIn });
        created = true;
      } catch (err) {
        // Validation errors from parseExpiry — don't retry
        if (
          err.message.includes("Invalid") ||
          err.message.includes("Expiry") ||
          err.message.includes("Days") ||
          err.message.includes("Hours")
        ) {
          return res.status(400).json({ message: err.message });
        }

        // Short code collision — retry with a new code
        if (err.name === "ConditionalCheckFailedException") {
          continue;
        }

        // Any other error — surface it
        throw err;
      }
    }

    return res.status(201).json({
      shortUrl: `${req.protocol}://${req.get("host")}/${shortCode}`,
      shortCode,
      expiresIn: expiresIn || null,
    });
  } catch (err) {
    console.error("POST /api/shortener error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = urlRouter;