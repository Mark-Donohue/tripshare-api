const fs = require("fs");

const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Trip = require("../models/trip");
const User = require("../models/user");
const { getCoordinates } = require("../util/geocoding");
const { default: mongoose } = require("mongoose");
const {
  getMalformedPayloadError,
  getTripNotFoundError,
  getInternalTripError,
} = require("../util/error");

const VERB_FETCH = "fetch";
const VERB_CREATE = "create";
const VERB_UPDATE = "update";
const VERB_DELETE = "delete";

/**
 * Fetches a single {@link Trip} by its given ID.
 * @param {*} req The current request object.
 * @param {*} res The current response object.
 * @param {*} next The next middleware function in the request-response cycle.
 */
const getTripById = async (req, res, next) => {
  const tripId = req.params.tripId;

  let trip;
  try {
    trip = await Trip.findById(tripId);
  } catch (err) {
    const error = getInternalTripError(VERB_FETCH);
    return next(error);
  }

  if (!trip) {
    const error = getTripNotFoundError();
    return next(error);
  }

  res.json(trip.toObject({ getters: true }));
};

/**
 * Fetches all trips by a given {@link User} ID.
 * @param {*} req The current request object.
 * @param {*} res The current response object.
 * @param {*} next The next middleware function in the request-response cycle.
 */
const getTripsByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  let userWithTrips;
  try {
    userWithTrips = await User.findById(userId).populate("trips");
  } catch (err) {
    const error = getInternalTripError(VERB_FETCH);
    return next(error);
  }

  if (!userWithTrips) {
    const error = getTripNotFoundError();
    return next(error);
  }

  res.json(userWithTrips.trips.map((trip) => trip.toObject({ getters: true })));
};

/**
 * Creates a single {@link Trip} object.
 * @param {*} req The current request object.
 * @param {*} res The current response object.
 * @param {*} next The next middleware function in the request-response cycle.
 */
const createTrip = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = getMalformedPayloadError();
    return next(error);
  }

  const { title, description, address } = req.body;
  const createUserId = req.userData.userId;
  const createTripError = getInternalTripError(VERB_CREATE);

  let user;
  try {
    user = await User.findById(createUserId);
  } catch (err) {
    return next(createTripError);
  }

  if (!user) {
    return next(new HttpError("User not found.", 404));
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
    return next(createTripError);
  }

  res.status(201).json(newTrip);
};

/**
 * Updates the title and description of a single {@link Trip} by a given ID.
 * @param {*} req The current request object.
 * @param {*} res The current response object.
 * @param {*} next The next middleware function in the request-response cycle.
 */
const updateTrip = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = getMalformedPayloadError();
    return next(error);
  }

  const tripId = req.params.tripId;
  const { title, description } = req.body;

  let tripToUpdate;
  try {
    tripToUpdate = await Trip.findById(tripId);
  } catch (err) {
    const error = getInternalTripError(VERB_FETCH);
    return next(error);
  }

  if (
    !tripToUpdate ||
    tripToUpdate.createUserId.toString() !== req.userData.userId
  ) {
    const error = getTripNotFoundError();
    return next(error);
  }

  tripToUpdate.title = title;
  tripToUpdate.description = description;

  try {
    await tripToUpdate.save();
  } catch (err) {
    const error = getInternalTripError(VERB_UPDATE);
    return next(error);
  }

  res.json(tripToUpdate.toObject({ getters: true }));
};

/**
 * Deletes a single {@link Trip} by a given ID.
 * @param {*} req The current request object.
 * @param {*} res The current response object.
 * @param {*} next The next middleware function in the request-response cycle.
 */
const deleteTrip = async (req, res, next) => {
  const tripId = req.params.tripId;
  const deleteTripError = getInternalTripError(VERB_DELETE);

  let tripToDelete;
  try {
    tripToDelete = await Trip.findById(tripId).populate("createUserId");
  } catch (err) {
    return next(deleteTripError);
  }

  if (!tripToDelete || tripToDelete.createUserId.id !== req.userData.userId) {
    const error = getTripNotFoundError();
    return next(error);
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
    return next(deleteTripError);
  }

  fs.unlink(tripImagePath, (err) => {
    if (err) {
      console.log(err);
    }
  });

  res.json({ message: "Trip deleted." });
};

exports.getTripById = getTripById;
exports.getTripsByUserId = getTripsByUserId;
exports.createTrip = createTrip;
exports.updateTrip = updateTrip;
exports.deleteTrip = deleteTrip;
