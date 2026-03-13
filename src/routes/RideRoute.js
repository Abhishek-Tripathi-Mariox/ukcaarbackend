const express = require("express");
const rideRouter = express.Router();
const RideController = require("../controllers/RideController");
const AuthMiddleware = require("../middleware/AuthMiddleware");
const ErrorHandlerMiddleware = require("../middleware/ErrorHandleMiddleware");
const AllValidator = require("../validators/AllValidator");
const ResponseMiddleware = require("../middleware/ResponseMiddleware");


//rides----------------
rideRouter.post(
  "/book-ride",
  AuthMiddleware().verifyUserToken,
  AllValidator().bookRideValidator,
  ErrorHandlerMiddleware(RideController().bookRide),
  ResponseMiddleware
);

rideRouter.get(
  "/ride-history",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RideController().getRideHistory),
  ResponseMiddleware
);

rideRouter.post(
  "/cancel-ride",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RideController().cancelRide),
  ResponseMiddleware
);

rideRouter.post(
  "/schedule-ride",
  AuthMiddleware().verifyUserToken,
  AllValidator().scheduleRideValidator,
  ErrorHandlerMiddleware(RideController().scheduleRide),
  ResponseMiddleware
);

rideRouter.post(
  "/accept-ride",
  AuthMiddleware().verifyUserToken,
  AllValidator().acceptRideValidator,
  ErrorHandlerMiddleware(RideController().acceptRide),
  ResponseMiddleware
);


module.exports = rideRouter;