const express = require("express");
const { check } = require("express-validator");

const tripController = require("../controllers/trip-controller");
const upload = require("../util/upload");
const token = require("../util/token");

const router = express.Router();

/**
 * Gets a single trip by a given ID.
 */
router.get("/:tripId", tripController.getTripById);

/**
 * Gets a list of trips by a user ID.
 */
router.get("/user/:userId", tripController.getTripsByUserId);

/** Register Token Middleware for Secure Routes. */
router.use(token);

/**
 * Creates a single trip.
 */
router.post(
  "/",
  upload.single("image"),
  [
    check("title").notEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").notEmpty(),
  ],
  tripController.createTrip
);

/**
 * Updates an existing trip.
 */
router.patch(
  "/:tripId",
  [check("title").notEmpty(), check("description").isLength({ min: 5 })],
  tripController.updateTrip
);

/**
 * Deletes an existing trip.
 */
router.delete("/:tripId", tripController.deleteTrip);

module.exports = router;
