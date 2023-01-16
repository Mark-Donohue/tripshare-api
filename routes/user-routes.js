const express = require("express");
const { check } = require("express-validator");

const userController = require("../controllers/user-controller");
const fileUpload = require("../util/file-upload");

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
    check("firstName").notEmpty(),
    check("lastName").notEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  userController.signUp
);

/**
 * Signs a user in.
 */
router.post("/signin", userController.signIn);

module.exports = router;
