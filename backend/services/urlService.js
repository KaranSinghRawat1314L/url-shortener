const {
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("../config/dynamodb");

const TABLE_NAME = "UrlMappings";
const MAX_EXPIRY_HOURS = 24 * 365; // 1 year

// ---------- Expiry Parser ----------
function parseExpiry(expiresIn) {
  if (!expiresIn) return null;
  if (typeof expiresIn !== "string") throw new Error("Invalid expiresIn format");

  const parts = expiresIn.trim().split(/\s+/);
  if (parts.length > 2) throw new Error("Invalid expiresIn format");

  const days = Number(parts[0]);
  if (!Number.isInteger(days) || days < 0)
    throw new Error("Days must be a non-negative integer");

  const hours = parts[1] !== undefined ? Number(parts[1]) : 0;
  if (Number.isNaN(hours) || hours < 0)
    throw new Error("Hours must be non-negative");

  const totalHours = days * 24 + hours;

  if (totalHours <= 0) throw new Error("Expiry duration must be greater than 0");
  if (totalHours > MAX_EXPIRY_HOURS)
    throw new Error("Expiry exceeds maximum allowed duration");

  return Date.now() + totalHours * 60 * 60 * 1000;
}

// ---------- CREATE URL ----------
async function createUrl({ shortCode, longURL, expiresIn }) {
  const expiresAt = parseExpiry(expiresIn);

  await dynamoDb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        shortCode,
        longURL,
        clickCount: 0,
        expiresAt,
        ttl: expiresAt ? Math.floor(expiresAt / 1000) : undefined,
        createdAt: Date.now(),
      },
      ConditionExpression: "attribute_not_exists(shortCode)",
    })
  );
}

// ---------- GET URL ----------
async function getUrl(shortCode) {
  const result = await dynamoDb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { shortCode },
    })
  );

  return result.Item;
}

// ---------- INCREMENT CLICK ----------
async function incrementClick(shortCode) {
  try {
    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { shortCode },
        UpdateExpression: "ADD clickCount :inc",
        ConditionExpression: "attribute_exists(shortCode)",
        ExpressionAttributeValues: { ":inc": 1 },
      })
    );
  } catch (err) {
    // Silently ignore — click count is non-critical
    console.error("incrementClick failed:", err.message);
  }
}

module.exports = { createUrl, getUrl, incrementClick };