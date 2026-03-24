require("dotenv").config();
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("./config/dynamodb");

(async () => {
  try {
    const res = await dynamoDb.send(
      new GetCommand({
        TableName: "UrlMappings",
        Key: { shortCode: "test" }
      })
    );
    console.log("DynamoDB working ✅", res);
  } catch (err) {
    console.error("DynamoDB error ❌", err);
  }
})();
