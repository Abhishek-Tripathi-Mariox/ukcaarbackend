const express = require("express");
const userRouter = express.Router();
const AuthController = require("../controllers/AuthController");
const ErrorHandlerMiddleware = require("../middleware/ErrorHandleMiddleware");
const ResponseMiddleware = require("../middleware/ResponseMiddleware"); 
const AuthMiddleware = require("../middleware/AuthMiddleware");
const AllValidator = require("../validators/AllValidator");  
const DriverController = require("../controllers/DriverController");
const ReviewController = require("../controllers/ReviewController");
const CashoutController = require("../controllers/CashoutController");

// Driver routes
userRouter.post(
  "/send-otp",
    AllValidator().validateSendOtp,
  ErrorHandlerMiddleware(DriverController().sendOtp),
  ResponseMiddleware
);

userRouter.post(
  "/verify-otp",
    AllValidator().validateVerifyOtp,
  ErrorHandlerMiddleware(DriverController().verifyOtp),
  ResponseMiddleware
);

userRouter.put(
  "/update-profile",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().updateDriverProfile),
  ResponseMiddleware
);

userRouter.get(
  "/get-driver-details",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().getDriverDetails),
  ResponseMiddleware
);

userRouter.put(
  "/update-vehicle-details",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().updateDriverVehicleDetails),
  ResponseMiddleware
);
userRouter.put(
  "/update-bank-details",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().updateBankDetail),
  ResponseMiddleware
);

userRouter.put(
  "/update-driving-license-details",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().updateDrivingLicenseDetails),
  ResponseMiddleware
);

userRouter.put(
  "/update-driving-rc-details",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().updateDrivingRcDetails),
  ResponseMiddleware
);

userRouter.put(
    "/update-status",
    AuthMiddleware().verifyDriverToken,
    ErrorHandlerMiddleware(DriverController().updateActiveInactiveStatus),
    ResponseMiddleware
);
userRouter.get(
    "/get-all-drivers",
    AuthMiddleware().verifyDriverToken,
    ErrorHandlerMiddleware(DriverController().getAllDrivers),
    ResponseMiddleware  
)

userRouter.get(
    "/get-scheduled-rides",
    AuthMiddleware().verifyDriverToken,
    ErrorHandlerMiddleware(DriverController().getScheduleRides),
    ResponseMiddleware  
)

// Driver location + ride flow
userRouter.post(
  "/update-location",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateUpdateDriverLocation,
  ErrorHandlerMiddleware(DriverController().updateDriverLocation),
  ResponseMiddleware
);

userRouter.get(
  "/ride-requests",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().getRideRequests),
  ResponseMiddleware
);

userRouter.post(
  "/accept-ride",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateDriverRideId,
  ErrorHandlerMiddleware(DriverController().acceptRideRequest),
  ResponseMiddleware
);

userRouter.post(
  "/reject-ride",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateDriverRideId,
  ErrorHandlerMiddleware(DriverController().rejectRideRequest),
  ResponseMiddleware
);

userRouter.get(
  "/current-ride",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().getCurrentRide),
  ResponseMiddleware
);

userRouter.post(
  "/arrive-pickup",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateDriverRideId,
  ErrorHandlerMiddleware(DriverController().arriveAtPickup),
  ResponseMiddleware
);

userRouter.post(
  "/verify-pickup-otp",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateVerifyPickupOtp,
  ErrorHandlerMiddleware(DriverController().verifyPickupOtp),
  ResponseMiddleware
);

userRouter.post(
  "/start-ride",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateDriverRideId,
  ErrorHandlerMiddleware(DriverController().startRide),
  ResponseMiddleware
);

userRouter.post(
  "/complete-ride",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateCompleteRide,
  ErrorHandlerMiddleware(DriverController().completeRide),
  ResponseMiddleware
);

userRouter.get(
  "/ride-history",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().getDriverRideHistory),
  ResponseMiddleware
);

userRouter.get(
  "/earnings-summary",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().getEarningsSummary),
  ResponseMiddleware
);

userRouter.post(
  "/emergency-sos",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().emergencySos),
  ResponseMiddleware
);

// Reviews
userRouter.get(
  "/reviews",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(ReviewController().getDriverReviews),
  ResponseMiddleware
);

userRouter.get(
  "/rating-summary",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(ReviewController().getDriverRatingSummary),
  ResponseMiddleware
);

// Journeys (Scheduled / Past / Completed)
userRouter.get(
  "/journeys",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().getJourneys),
  ResponseMiddleware
);

userRouter.get(
  "/journeys/:rideId",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(DriverController().getJourneyDetails),
  ResponseMiddleware
);

// Wallet / Cashout
userRouter.get(
  "/wallet-summary",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(CashoutController().getWalletSummary),
  ResponseMiddleware
);

userRouter.get(
  "/wallet-history",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(CashoutController().getWalletHistory),
  ResponseMiddleware
);

userRouter.post(
  "/cashout-request",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateCashoutRequest,
  ErrorHandlerMiddleware(CashoutController().requestCashout),
  ResponseMiddleware
);

userRouter.get(
  "/cashout-history",
  AuthMiddleware().verifyDriverToken,
  ErrorHandlerMiddleware(CashoutController().getCashoutHistory),
  ResponseMiddleware
);

userRouter.post(
  "/cancel-cashout",
  AuthMiddleware().verifyDriverToken,
  AllValidator().validateCancelCashout,
  ErrorHandlerMiddleware(CashoutController().cancelCashoutRequest),
  ResponseMiddleware
);


module.exports = userRouter;
