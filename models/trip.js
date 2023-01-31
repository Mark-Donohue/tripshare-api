const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Model that represents a trip.
 */
const tripSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
  imageUrl: { type: String, required: false },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  createUserId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Trip", tripSchema);
