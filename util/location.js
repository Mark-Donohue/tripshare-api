const axios = require("axios");

const HttpError = require("../models/http-error");

const API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Utility logic for calculating coordinates for a given address.
 * 
 * @param {*} address The address from which to calculate the coordinates.
 * @returns The coordinates for the address.
 */
async function getCoordinates(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError(
      "Could not finnd coordinates for specified address.",
      400
    );
  }

  return data.results[0].geometry.location;
}

exports.getCoordinates = getCoordinates;