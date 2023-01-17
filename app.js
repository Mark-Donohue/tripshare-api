const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const tripRoutes = require("./routes/trip-routes");
const userRoutes = require("./routes/user-routes");
const HttpError = require("./models/http-error");

const API_PORT = process.env.API_PORT;

const app = express();

/** Register Parser */
app.use(bodyParser.json());

/** Register File Upload Access */
app.use("/uploads/images", express.static(path.join("uploads", "images")));

/** Set Global Response Headers */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

/** Register Endpoints */
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);

/** Register Unsupported Route Handler */
app.use((req, res, next) => {
  throw new HttpError("Route not found.", 404);
});

/** Register Error Handler */
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error occured.",
  });
});

/** Start API */
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.ibbrtqu.mongodb.net/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`
  )
  .then(() => {
    app.listen(API_PORT);
    console.log(`==> TripShare API running on port ${API_PORT}.`);
  })
  .catch((err) => {
    console.log("==> Failed to start server. Error: " + err);
  });
