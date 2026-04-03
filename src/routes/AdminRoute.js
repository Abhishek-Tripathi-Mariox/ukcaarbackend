const express = require("express");
const adminRouter = express.Router();
const AdminController = require("../controllers/AdminController");
const ErrorHandlerMiddleware = require("../middleware/ErrorHandleMiddleware");
const ResponseMiddleware = require("../middleware/ResponseMiddleware");
const AuthMiddleware = require("../middleware/AuthMiddleware");

adminRouter.post(
  "/login",
  ErrorHandlerMiddleware(AdminController().login),
  ResponseMiddleware,
);

adminRouter.post(
  "/forgot-password",
  ErrorHandlerMiddleware(AdminController().forgotPassword),
  ResponseMiddleware,
);

adminRouter.post(
  "/verify-forgot-password-otp",
  ErrorHandlerMiddleware(AdminController().verifyForgotPasswordOtp),
  ResponseMiddleware,
);

adminRouter.post(
  "/reset-password",
  ErrorHandlerMiddleware(AdminController().resetPassword),
  ResponseMiddleware,
);

adminRouter.post(
  "/change-password",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().changePassword),
  ResponseMiddleware,
);

adminRouter.get(
  "/me",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().me),
  ResponseMiddleware,
);

adminRouter.post(
  "/logout",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().logout),
  ResponseMiddleware,
);

adminRouter.get(
  "/dashboard/summary",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().dashboardSummary),
  ResponseMiddleware,
);

adminRouter.get(
  "/dashboard/earnings",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().dashboardEarnings),
  ResponseMiddleware,
);

adminRouter.get(
  "/users",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().listUsers),
  ResponseMiddleware,
);

adminRouter.get(
  "/users/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getUser),
  ResponseMiddleware,
);

adminRouter.put(
  "/users/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateUser),
  ResponseMiddleware,
);

adminRouter.patch(
  "/users/:id/status",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateUserStatus),
  ResponseMiddleware,
);

adminRouter.get(
  "/drivers",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().listDrivers),
  ResponseMiddleware,
);

adminRouter.get(
  "/drivers/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getDriver),
  ResponseMiddleware,
);

adminRouter.put(
  "/drivers/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateDriver),
  ResponseMiddleware,
);

adminRouter.put(
  "/drivers/:id/profile",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateDriver),
  ResponseMiddleware,
);

adminRouter.put(
  "/drivers/:id/vehicle",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateDriver),
  ResponseMiddleware,
);

adminRouter.put(
  "/drivers/:id/bank",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateDriver),
  ResponseMiddleware,
);

adminRouter.put(
  "/drivers/:id/license",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateDriver),
  ResponseMiddleware,
);

adminRouter.put(
  "/drivers/:id/rc",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateDriver),
  ResponseMiddleware,
);

adminRouter.patch(
  "/drivers/:id/approve",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().approveDriver),
  ResponseMiddleware,
);

adminRouter.patch(
  "/drivers/:id/reject",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().rejectDriver),
  ResponseMiddleware,
);

adminRouter.patch(
  "/drivers/:id/status",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateDriverStatus),
  ResponseMiddleware,
);

adminRouter.get(
  "/drivers/:id/reviews",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().listDriverReviews),
  ResponseMiddleware,
);

adminRouter.get(
  "/drivers/:id/wallet",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().driverWallet),
  ResponseMiddleware,
);

adminRouter.get(
  "/drivers/:id/wallet-history",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().driverWalletHistory),
  ResponseMiddleware,
);

adminRouter.get(
  "/drivers/:id/cashouts",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().listDriverCashouts),
  ResponseMiddleware,
);

adminRouter.patch(
  "/drivers/:id/ban",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().banDriver),
  ResponseMiddleware,
);

adminRouter.get(
  "/rides",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().listRides),
  ResponseMiddleware,
);

adminRouter.get(
  "/rides/:rideId",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getRide),
  ResponseMiddleware,
);

adminRouter.patch(
  "/rides/:rideId/status",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateRideStatus),
  ResponseMiddleware,
);

adminRouter.patch(
  "/rides/:rideId/assign-driver",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().assignDriverToRide),
  ResponseMiddleware,
);

adminRouter.patch(
  "/rides/:rideId/cancel",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().cancelRide),
  ResponseMiddleware,
);

adminRouter.get(
  "/cashouts",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().listCashouts),
  ResponseMiddleware,
);

adminRouter.get(
  "/cashouts/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getCashout),
  ResponseMiddleware,
);

adminRouter.patch(
  "/cashouts/:id/approve",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().approveCashout),
  ResponseMiddleware,
);

adminRouter.patch(
  "/cashouts/:id/reject",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().rejectCashout),
  ResponseMiddleware,
);

adminRouter.patch(
  "/cashouts/:id/mark-paid",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().markCashoutPaid),
  ResponseMiddleware,
);

adminRouter.get(
  "/reviews",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().listReviews),
  ResponseMiddleware,
);

adminRouter.get(
  "/reviews/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getReview),
  ResponseMiddleware,
);

adminRouter.delete(
  "/reviews/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().deleteReview),
  ResponseMiddleware,
);

adminRouter.get(
  "/payment-methods",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().listPaymentMethods),
  ResponseMiddleware,
);

module.exports = adminRouter;
