const express = require("express");
const userRouter = express.Router();
const AuthController = require("../controllers/AuthController");
const AddressController = require("../controllers/AddressController");
const PaymentController = require("../controllers/PaymentController");
const ErrorHandlerMiddleware = require("../middleware/ErrorHandleMiddleware");
const ResponseMiddleware = require("../middleware/ResponseMiddleware"); 
const AuthMiddleware = require("../middleware/AuthMiddleware");
const AllValidator = require("../validators/AllValidator");  
const RiderController = require("../controllers/RiderController");     

// User routes
userRouter.post(
  "/send-otp",
    AllValidator().validateSendOtp,
  ErrorHandlerMiddleware(AuthController().sendOtp),
  ResponseMiddleware
);

userRouter.post(
  "/verify-otp",
    AllValidator().validateVerifyOtp,
  ErrorHandlerMiddleware(AuthController().verifyOtp),
  ResponseMiddleware
);

userRouter.put(
  "/update-profile",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AuthController().updateProfile),
  ResponseMiddleware
);

userRouter.get(
  "/user-details",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AuthController().getUserDetails),
  ResponseMiddleware
);



// Address routes
userRouter.post(
  "/add-address",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AddressController().addAddress),
  ResponseMiddleware
);

userRouter.get(
  "/get-addresses",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AddressController().getAddresses),
  ResponseMiddleware
);

userRouter.delete(
  "/delete-address/:id",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AddressController().deleteAddress),
  ResponseMiddleware
);

// Payment routes
userRouter.post(
  "/add-payment-method",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(PaymentController().addPaymentMethod),
  ResponseMiddleware
);

userRouter.get(
  "/get-payment-methods",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(PaymentController().getPaymentMethods),
  ResponseMiddleware
);




userRouter.post(
  "/register-rider",
  AuthMiddleware().verifyUserToken,
   AllValidator().validateRegisterRider,
  ErrorHandlerMiddleware(RiderController().createRider),
  ResponseMiddleware,
);

userRouter.get(
  "/get-rider",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RiderController().getRiderDetails),
  ResponseMiddleware,
);

module.exports = userRouter;
