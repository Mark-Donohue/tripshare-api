const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const {
  getSignUpError,
  getSignInError,
  getMalformedPayloadError,
  getInvalidCredentialsError,
} = require("../util/error");

/**
 * Fetches all existing {@link User} objects.
 */
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new HttpError("Failed to fetch users, please try again.", 500));
  }

  res.json(users.map((user) => user.toObject({ getters: true })));
};

/**
 * Creates a single {@link User} object.
 */
const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = getMalformedPayloadError();
    return next(error);
  }

  const { firstName, lastName, email, password } = req.body;
  const signUpError = getSignUpError();

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(signUpError);
  }

  if (existingUser) {
    return next(new HttpError(`Email address already in use.`, 400));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(signUpError);
  }

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    image: req.file.path,
    trips: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(signUpError);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, userEmail: newUser.email },
      process.env.JWT_KEY,
      {
        expiresIn: "30m",
      }
    );
  } catch (err) {
    return next(signUpError);
  }

  res.status(201).json({ userId: newUser.id, token: token });
};

/**
 * Fetches a single {@link User} object.
 */
const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const signInError = getSignInError();
  const credentialsError = getInvalidCredentialsError();

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(signInError);
  }

  if (!existingUser) {
    return next(credentialsError);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(signInError);
  }

  if (!isValidPassword) {
    return next(credentialsError);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, userEmail: existingUser.email },
      process.env.JWT_KEY,
      {
        expiresIn: "30m",
      }
    );
  } catch (err) {
    return next(signInError);
  }

  res.json({ userId: existingUser.id, token: token });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.signIn = signIn;
