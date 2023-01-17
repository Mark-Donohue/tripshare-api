const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

/**
 * Utility logic for handling authorization and tokens.
 * @param {*} req The current request object.
 * @param {*} res The current response object.
 * @param {*} next The next middleware function in the request-response cycle.
 */
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Unauthorized.", 401);
    }

    // Decode token and add user ID to request.
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      userId: decodedToken.userId,
    };

    next();
  } catch (err) {
    const error = new HttpError("Unauthorized.", 401);
    return next(error);
  }
};
