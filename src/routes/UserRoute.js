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

// Legacy alias
userRouter.post(
  "/sendOtp",
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

// Legacy alias
userRouter.post(
  "/verifyOtp",
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

// Legacy alias
userRouter.put(
  "/updateProfile",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AuthController().updateProfile),
  ResponseMiddleware
);

userRouter.put(
  "/notification-settings",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AuthController().updateNotificationSettings),
  ResponseMiddleware
);

userRouter.get(
  "/user-details",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AuthController().getUserDetails),
  ResponseMiddleware
);

// Legacy alias
userRouter.get(
  "/profileDetails",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AuthController().getUserDetails),
  ResponseMiddleware
);

userRouter.post(
  "/apply-referral-code",
  AuthMiddleware().verifyUserToken,
  AllValidator().validateApplyReferralCode,
  ErrorHandlerMiddleware(AuthController().applyReferralCode),
  ResponseMiddleware
);



// Address routes
userRouter.post(
  "/add-address",
  AuthMiddleware().verifyUserToken,
  AllValidator().validateAddAddress,
  ErrorHandlerMiddleware(AddressController().addAddress),
  ResponseMiddleware
);

// Legacy alias
userRouter.post(
  "/addAddress",
  AuthMiddleware().verifyUserToken,
  AllValidator().validateAddAddress,
  ErrorHandlerMiddleware(AddressController().addAddress),
  ResponseMiddleware
);

userRouter.get(
  "/get-addresses",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AddressController().getAddresses),
  ResponseMiddleware
);

// Legacy alias
userRouter.get(
  "/getAddress",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AddressController().getAddresses),
  ResponseMiddleware
);

userRouter.put(
  "/update-address/:id",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AddressController().updateAddress),
  ResponseMiddleware
);

userRouter.delete(
  "/delete-address/:id",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AddressController().deleteAddress),
  ResponseMiddleware
);

// Legacy alias
userRouter.delete(
  "/deleteAddress/:id",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(AddressController().deleteAddress),
  ResponseMiddleware
);

// Payment routes
userRouter.post(
  "/add-payment-method",
  AuthMiddleware().verifyUserToken,
  AllValidator().validateAddPaymentMethod,
  ErrorHandlerMiddleware(PaymentController().addPaymentMethod),
  ResponseMiddleware
);

// Legacy alias
userRouter.post(
  "/addPaymentMethod",
  AuthMiddleware().verifyUserToken,
  AllValidator().validateAddPaymentMethod,
  ErrorHandlerMiddleware(PaymentController().addPaymentMethod),
  ResponseMiddleware
);

userRouter.get(
  "/get-payment-methods",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(PaymentController().getPaymentMethods),
  ResponseMiddleware
);

// Legacy alias
userRouter.get(
  "/getPaymentMethod",
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

// Legacy alias
userRouter.post(
  "/createRider",
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

// Legacy alias
userRouter.get(
  "/getRider",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RiderController().getRiderDetails),
  ResponseMiddleware,
);

module.exports = userRouter;
