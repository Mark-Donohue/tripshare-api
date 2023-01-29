const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./s3-client");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * Utility logic for uploading files.
 */
const fileUpload = multer({
  limits: 500000,
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileExt = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + "." + fileExt);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type.");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
