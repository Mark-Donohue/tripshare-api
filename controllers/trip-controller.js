const fs = require("fs");

const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Trip = require("../models/trip");
const User = require("../models/user");
const {
  getMalformedPayloadError,
  getInternalTripFetchError,
  getInternalTripCreateError,
  getInternalTripUpdateError,
} = require("../util/error");
const { getCoordinates } = require("../util/geocoding");
const { default: mongoose } = require("mongoose");

/**
 * Fetches a single {@link Trip} by its given ID.
 */

/**
 *
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const getTripById = async (req, res, next) => {
  const tripId = req.params.tripId;

  let trip;
  try {
    trip = await Trip.findById(tripId);
  } catch (err) {
    const error = getInternalTripFetchError();
    return next(error);
  }

  if (!trip) {
    return next(createTripNotFoundError(tripId));
  }

  res.json(trip.toObject({ getters: true }));
};

/**
 * Fetches all trips by a given {@link User} ID.
 */
const getTripsByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  let userWithTrips;
  try {
    userWithTrips = await User.findById(userId).populate("trips");
  } catch (err) {
    const error = getInternalTripFetchError();
    return next(error);
  }

  if (!userWithTrips) {
    return next(new HttpError("Trip(s) not found.", 404));
  }

  res.json(userWithTrips.trips.map((trip) => trip.toObject({ getters: true })));
};

/**
 * Creates a single {@link Trip} object.
 */
const createTrip = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(getInvalidInputError());
  }

  const { title, description, address } = req.body;
  const createUserId = req.userData.userId;

  let user;
  try {
    user = await User.findById(createUserId);
  } catch (err) {
    return next(new HttpError("Failed to create trip, please try again.", 500));
  }

  if (!user) {
    return next(new HttpError(`User with ID ${createUserId} not found.`, 404));
  }

  let coordinates;
  try {
    coordinates = await getCoordinates(address);
  } catch (err) {
    return next(err);
  }

  const newTrip = new Trip({
    title,
    description,
    image: req.file.path,
    address,
    coordinates,
    createUserId,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await newTrip.save({ session: session });

    user.trips.push(newTrip);
    await user.save({ session: session });

    await session.commitTransaction();
  } catch (err) {
    return next(new HttpError("Failed to create trip, please try again.", 500));
  }

  res.status(201).json(newTrip);
};

/**
 * Updates the title and description of a single {@link Trip} by a given ID.
 */
const updateTrip = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(getInvalidInputError());
  }

  const tripId = req.params.tripId;
  const { title, description } = req.body;

  let tripToUpdate;
  try {
    tripToUpdate = await Trip.findById(tripId);
  } catch (err) {
    return next(new HttpError("Failed to fetch trip, please try again.", 500));
  }

  if (
    !tripToUpdate ||
    tripToUpdate.createUserId.toString() !== req.userData.userId
  ) {
    return next(createTripNotFoundError(tripId));
  }

  tripToUpdate.title = title;
  tripToUpdate.description = description;

  try {
    await tripToUpdate.save();
  } catch (err) {
    return next(new HttpError("Failed to update trip, please try again.", 500));
  }

  res.json(tripToUpdate.toObject({ getters: true }));
};

/**
 * Deletes a single {@link Trip} by a given ID.
 */
const deleteTrip = async (req, res, next) => {
  const tripId = req.params.tripId;

  let tripToDelete;
  try {
    tripToDelete = await Trip.findById(tripId).populate("createUserId");
  } catch (err) {
    return next(new HttpError("Failed to delete trip, please try again.", 500));
  }

  if (!tripToDelete || tripToDelete.createUserId.id !== req.userData.userId) {
    return next(createTripNotFoundError(tripId));
  }

  const tripImagePath = tripToDelete.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await tripToDelete.remove({ session: session });

    // Update the trip IDs assosciated with the corresponding user.
    tripToDelete.createUserId.trips.pull(tripToDelete);
    await tripToDelete.createUserId.save({ session: session });

    await session.commitTransaction();
  } catch (err) {
    return next(new HttpError("Failed to delete trip, please try again.", 500));
  }

  fs.unlink(tripImagePath, (err) => {
    if (err) {
      console.log(err);
    }
  });

  res.json({ message: "Trip deleted." });
};

/**
 * Generates an error message indicating that a {@link Trip} could not be found.
 * @param {Number} tripId The ID of the trip.
 * @returns {HttpError} The error message.
 */
function getTripNotFoundError(tripId) {
  return new HttpError(`Trip not found for ID: ${tripId}`, 404);
}

exports.getTripById = getTripById;
exports.getTripsByUserId = getTripsByUserId;
exports.createTrip = createTrip;
exports.updateTrip = updateTrip;
exports.deleteTrip = deleteTrip;
