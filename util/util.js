const HttpError = require("../models/http-error");

function getInvalidInputError() {
  return new HttpError("Invalid inputs.", 400);
}

exports.getInvalidInputError = getInvalidInputError;
