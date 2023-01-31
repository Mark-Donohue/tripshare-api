const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

/**
 * Model that represents a user.
 */
const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 8 },
  image: { type: String, required: false },
  imageUrl: { type: String, required: false },
  trips: [{ type: mongoose.Types.ObjectId, required: true, ref: "Trip" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
