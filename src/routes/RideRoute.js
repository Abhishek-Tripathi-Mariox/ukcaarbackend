const express = require("express");
const rideRouter = express.Router();
const RideController = require("../controllers/RideController");
const ReviewController = require("../controllers/ReviewController");
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

// Legacy alias
rideRouter.post(
  "/cancelRide",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RideController().cancelRide),
  ResponseMiddleware
);

rideRouter.get(
  "/current-ride",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RideController().getCurrentRide),
  ResponseMiddleware
);

rideRouter.get(
  "/ride-details/:rideId",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RideController().getRideDetails),
  ResponseMiddleware
);

rideRouter.get(
  "/fare-estimate",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RideController().getFareEstimate),
  ResponseMiddleware
);

rideRouter.get(
  "/available-drivers",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RideController().getAvailableDrivers),
  ResponseMiddleware
);

rideRouter.post(
  "/schedule-ride",
  AuthMiddleware().verifyUserToken,
  AllValidator().scheduleRideValidator,
  ErrorHandlerMiddleware(RideController().scheduleRide),
  ResponseMiddleware
);

// Legacy alias
rideRouter.post(
  "/scheduleRide",
  AuthMiddleware().verifyUserToken,
  AllValidator().scheduleRideValidator,
  ErrorHandlerMiddleware(RideController().scheduleRide),
  ResponseMiddleware
);

rideRouter.post(
  "/accept-ride",
  AuthMiddleware().verifyDriverToken,
  AllValidator().acceptRideValidator,
  ErrorHandlerMiddleware(RideController().acceptRide),
  ResponseMiddleware
);

// Legacy alias
rideRouter.post(
  "/acceptRide",
  AuthMiddleware().verifyDriverToken,
  AllValidator().acceptRideValidator,
  ErrorHandlerMiddleware(RideController().acceptRide),
  ResponseMiddleware
);

// Reviews (rider -> driver)
rideRouter.post(
  "/submit-review",
  AuthMiddleware().verifyUserToken,
  AllValidator().validateSubmitReview,
  ErrorHandlerMiddleware(ReviewController().submitReview),
  ResponseMiddleware
);

// Payment/Receipt
rideRouter.get(
  "/receipt/:rideId",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RideController().getRideReceipt),
  ResponseMiddleware
);

rideRouter.post(
  "/mark-paid",
  AuthMiddleware().verifyUserToken,
  AllValidator().validateMarkRidePaid,
  ErrorHandlerMiddleware(RideController().markRidePaid),
  ResponseMiddleware
);

// SOS
rideRouter.post(
  "/emergency-sos",
  AuthMiddleware().verifyUserToken,
  AllValidator().validateEmergencySos,
  ErrorHandlerMiddleware(RideController().emergencySos),
  ResponseMiddleware
);


module.exports = rideRouter;
