const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");
const https = require("https");

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
});

const dynamoDb = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION || "ap-south-1",
  requestHandler: new NodeHttpHandler({
    httpsAgent: agent,
  }),
  maxAttempts: 2,
});

module.exports = dynamoDb;