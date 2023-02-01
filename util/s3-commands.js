const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = require("./s3-client");
const HttpError = require("../models/http-error");

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * Makes a request to S3 to generate a publicly accessible URL for the provided image.
 * @param {*} image The given image.
 * @returns The generated URL.
 */
async function getImageUrl(image) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: image,
  };

  const command = new GetObjectCommand(params);

  let url;
  try {
    url = await getSignedUrl(s3Client, command, { expiresIn: 1800 });
  } catch (err) {
    throw new HttpError("Unable to get image URL from S3", 500);
  }

  return url;
}

/**
 * Makes a request to S3 to delete the provided image.
 * @param {*} image The given image.
 */
async function deleteImage(image) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: image,
  };

  const command = new DeleteObjectCommand(params);

  try {
    return s3Client.send(command);
  } catch (err) {
    throw new HttpError("Unable to delete image from S3", 500);
  }
}

exports.getImageUrl = getImageUrl;
exports.deleteImage = deleteImage;
