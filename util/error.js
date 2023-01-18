const HttpError = require("../models/http-error");

/** Utility logic for generating error message responses. */

function getSignUpError() {
  return new HttpError("Sign up failed, please try again.", 500);
}

function getSignInError() {
  return new HttpError("Sign in failed, please try again.", 500);
}

function getInvalidCredentialsError() {
  return new HttpError("Invalid credentials.", 401);
}

function getMalformedPayloadError() {
  return new HttpError("Malformed payload body.", 400);
}

function getTripNotFoundError() {
  return new HttpError("Trip(s) not found.", 404);
}

function getInternalTripError(verb) {
  return new HttpError(`Failed to ${verb} trip(s), please try again.`, 500);
}

exports.getSignUpError = getSignUpError;
exports.getSignInError = getSignInError;
exports.getInvalidCredentialsError = getInvalidCredentialsError;
exports.getMalformedPayloadError = getMalformedPayloadError;
exports.getTripNotFoundError = getTripNotFoundError;
exports.getInternalTripError = getInternalTripError;
