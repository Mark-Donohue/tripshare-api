const { S3Client } = require("@aws-sdk/client-s3");

/**
 * Utility logic for configuring an AWS S3 client.
 */
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: process.env.AWS_BUCKET_REGION,
});

module.exports = s3Client;
