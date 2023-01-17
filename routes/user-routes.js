const express = require("express");
const { check } = require("express-validator");

const userController = require("../controllers/user-controller");
const fileUpload = require("../util/upload");

const router = express.Router();

/**
 * Fetches all existing users.
 */
router.get("/", userController.getUsers);

/**
 * Creates a new user.
 */
router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("firstName").isString().notEmpty(),
    check("lastName").notEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  userController.signUp
);

/**
 * Authenticates and authorizes a user.
 */
router.post("/signin", userController.signIn);

module.exports = router;
