const { randomBytes } = require("crypto");

const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateShortCode(length = 7) {
  return Array.from(randomBytes(length))
    .map((b) => chars[b % chars.length])
    .join("");
}

module.exports = generateShortCode;