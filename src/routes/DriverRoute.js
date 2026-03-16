const express = require("express");
const userRouter = express.Router();
const AuthController = require("../controllers/AuthController");
const ErrorHandlerMiddleware = require("../middleware/ErrorHandleMiddleware");
const ResponseMiddleware = require("../middleware/ResponseMiddleware"); 
const AuthMiddleware = require("../middleware/AuthMiddleware");
const AllValidator = require("../validators/AllValidator");  
const DriverController = require("../controllers/DriverController");

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



module.exports = userRouter;