const mongoose = require("mongoose");
const crypto = require("crypto");
const AdminService = require("../services/AdminService");
const UserService = require("../services/UserService");
const DriverService = require("../services/DriverService");
const RideService = require("../services/RideService");
const CashoutService = require("../services/CashoutService");
const ReviewService = require("../services/ReviewService");
const PaymentService = require("../services/PaymentService");
const tokenUtil = require("../util/tokenUtil");
const { hashPassword, verifyPassword } = require("../util/passwordUtil");
const { redisClient } = require("../util/redis");
const mail = require("../util/mail");

module.exports = () => {
  const sanitizeAdmin = (admin) => {
    if (!admin) return null;
    const doc = admin.toObject ? admin.toObject() : { ...admin };
    delete doc.passwordHash;
    delete doc.resetOtp;
    delete doc.resetOtpExpiresAt;
    return doc;
  };

  const sanitizeUser = (user) => {
    if (!user) return null;
    return user.toObject ? user.toObject() : { ...user };
  };

  const sanitizeDriver = (driver) => {
    if (!driver) return null;
    return driver.toObject ? driver.toObject() : { ...driver };
  };

  const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
  const adminOtpKey = (email) => `admin:otp:${String(email).toLowerCase()}`;
  const adminResetKey = (email) => `admin:reset:${String(email).toLowerCase()}`;

  const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.rCode = 0;
        req.msg = "Email and password are required";
        return next();
      }

      const admin = await AdminService().fetchByQuery({ email: email.toLowerCase() });
      if (!admin || !admin.isActive) {
        req.rCode = 3;
        req.msg = "invalid_credentials";
        return next();
      }

      const isValid = await verifyPassword(password, admin.passwordHash);
      if (!isValid) {
        req.rCode = 3;
        req.msg = "invalid_credentials";
        return next();
      }

      await AdminService().update(
        { _id: admin._id },
        { lastLoginAt: new Date() },
      );

      const token = tokenUtil.generateToken({ adminId: admin._id });
      req.rData = { admin: sanitizeAdmin(admin), token };
      req.msg = "login successfully";
    } catch (error) {
      req.msg = "Failed to login";
      req.error = error;
    }
    next();
  };

  const forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        req.rCode = 0;
        req.msg = "Email is required";
        return next();
      }

      const admin = await AdminService().fetchByQuery({ email: email.toLowerCase() });
      if (!admin) {
        req.rCode = 5;
        req.msg = "Admin not found";
        return next();
      }

      const otp = generateOtp();
      await redisClient.set(adminOtpKey(email), otp, { EX: 300 });

      const subject = "UKCAAR Admin Password Reset OTP";
      const text = `Your admin password reset OTP is ${otp}. It will expire in 5 minutes.`;
      const html = `<p>Your admin password reset OTP is <strong>${otp}</strong>.</p><p>This OTP will expire in 5 minutes.</p>`;
      await mail().sendMail(email, subject, text, html);

      req.rData = { email };
      req.msg = "OTP sent successfully";
    } catch (error) {
      req.msg = "Failed to send OTP";
      req.error = error;
    }
    next();
  };

  const verifyForgotPasswordOtp = async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        req.rCode = 0;
        req.msg = "Email and otp are required";
        return next();
      }
      const key = adminOtpKey(email);
      const storedOtp = await redisClient.get(key);

      if (!storedOtp || storedOtp !== otp) {
        req.rCode = 0;
        req.msg = "Invalid or expired OTP";
        return next();
      }

      await redisClient.set(adminResetKey(email), "verified", { EX: 600 });
      await redisClient.del(key);

      req.rData = { email, verified: true };
      req.msg = "OTP verified successfully";
    } catch (error) {
      req.msg = "Failed to verify OTP";
      req.error = error;
    }
    next();
  };

  const resetPassword = async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        req.rCode = 0;
        req.msg = "Email, otp and newPassword are required";
        return next();
      }

      const verified = await redisClient.get(adminResetKey(email));
      const storedOtp = await redisClient.get(adminOtpKey(email));
      if (verified !== "verified" || (storedOtp && storedOtp !== otp)) {
        req.rCode = 0;
        req.msg = "Invalid or expired OTP";
        return next();
      }

      const admin = await AdminService().fetchByQuery({ email: email.toLowerCase() });
      if (!admin) {
        req.rCode = 5;
        req.msg = "Admin not found";
        return next();
      }

      const passwordHash = await hashPassword(newPassword);
      const updatedAdmin = await AdminService().update(
        { _id: admin._id },
        {
          passwordHash,
          resetOtp: "",
          resetOtpExpiresAt: null,
        },
      );

      await redisClient.del(adminResetKey(email));
      await redisClient.del(adminOtpKey(email));

      req.rData = { admin: sanitizeAdmin(updatedAdmin) };
      req.msg = "Password reset successfully";
    } catch (error) {
      req.msg = "Failed to reset password";
      req.error = error;
    }
    next();
  };

  const changePassword = async (req, res, next) => {
    try {
      const { adminId, oldPassword, newPassword } = req.body;
      if (!adminId || !oldPassword || !newPassword) {
        req.rCode = 0;
        req.msg = "oldPassword and newPassword are required";
        return next();
      }

      const admin = await AdminService().fetchByQuery({ _id: adminId });
      if (!admin) {
        req.rCode = 5;
        req.msg = "Admin not found";
        return next();
      }

      const isValid = await verifyPassword(oldPassword, admin.passwordHash);
      if (!isValid) {
        req.rCode = 0;
        req.msg = "Entered password is incorrect!";
        return next();
      }

      const passwordHash = await hashPassword(newPassword);
      const updatedAdmin = await AdminService().update(
        { _id: adminId },
        { passwordHash },
      );

      req.rData = { admin: sanitizeAdmin(updatedAdmin) };
      req.msg = "Password updated successfully. Please login with new password!";
    } catch (error) {
      req.msg = "Failed to change password";
      req.error = error;
    }
    next();
  };

  const me = async (req, res, next) => {
    try {
      const { adminId } = req.body;
      const admin = await AdminService().fetchByQuery({ _id: adminId });

      if (!admin) {
        req.rCode = 5;
        req.msg = "Admin not found";
        return next();
      }

      req.rData = { admin: sanitizeAdmin(admin) };
      req.msg = "Admin details fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch admin details";
      req.error = error;
    }
    next();
  };

  const logout = async (req, res, next) => {
    try {
      req.rData = {};
      req.msg = "logout successfully";
    } catch (error) {
      req.msg = "Failed to logout";
      req.error = error;
    }
    next();
  };

  const dashboardSummary = async (req, res, next) => {
    try {
      const User = mongoose.model("User");
      const Driver = mongoose.model("Driver");
      const Ride = mongoose.model("Ride");
      const [
        totalUsers,
        totalDrivers,
        totalRides,
        activeRides,
        completedRides,
        cancelledRides,
        pendingDriverApprovals,
        pendingCashouts,
        earningsRows,
      ] = await Promise.all([
        User.countDocuments({}),
        Driver.countDocuments({}),
        Ride.countDocuments({}),
        Ride.countDocuments({ status: { $in: ["requested", "accepted", "arrived", "started", "booked", "scheduled"] } }),
        Ride.countDocuments({ status: "completed" }),
        Ride.countDocuments({ status: "canceled" }),
        Driver.countDocuments({ approvalStatus: "Pending" }),
        CashoutService().count({ status: "Pending" }),
        RideService().aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, totalRevenue: { $sum: "$fare" } } },
        ]),
      ]);

      req.rData = {
        totalUsers,
        totalDrivers,
        totalRides,
        activeRides,
        completedRides,
        cancelledRides,
        pendingDriverApprovals,
        pendingCashouts,
        totalRevenue: earningsRows[0]?.totalRevenue || 0,
        currency: "INR",
      };
      req.msg = "Dashboard summary fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch dashboard summary";
      req.error = error;
    }
    next();
  };

  const dashboardEarnings = async (req, res, next) => {
    try {
      const { startDate, endDate, timezone = "UTC" } = req.query;
      const match = { status: "completed" };
      if (startDate || endDate) {
        match.completedAt = {};
        if (startDate) match.completedAt.$gte = new Date(startDate);
        if (endDate) match.completedAt.$lte = new Date(endDate);
      }

      const rows = await RideService().aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$fare" },
            totalRides: { $sum: 1 },
            averageFare: { $avg: "$fare" },
          },
        },
      ]);

      req.rData = {
        totalRevenue: rows[0]?.totalRevenue || 0,
        totalRides: rows[0]?.totalRides || 0,
        averageFare: Number((rows[0]?.averageFare || 0).toFixed(2)),
        timezone,
        currency: "INR",
      };
      req.msg = "Earnings summary fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch earnings summary";
      req.error = error;
    }
    next();
  };

  const listUsers = async (req, res, next) => {
    try {
      let { page = 1, limit = 20, search = "", sortBy = "createdAt", order = "desc" } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const query = {};
      if (search) {
        query.$or = [
          { fullname: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const [users, total] = await Promise.all([
        mongoose.model("User").find(query).skip(skip).limit(limit).sort({ [sortBy]: order === "asc" ? 1 : -1 }),
        mongoose.model("User").countDocuments(query),
      ]);

      req.rData = {
        users: users.map(sanitizeUser),
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Users fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch users";
      req.error = error;
    }
    next();
  };

  const getUser = async (req, res, next) => {
    try {
      const user = await mongoose.model("User").findById(req.params.id);
      if (!user) {
        req.rCode = 5;
        req.msg = "User not found";
        return next();
      }
      req.rData = { user: sanitizeUser(user) };
      req.msg = "User fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch user";
      req.error = error;
    }
    next();
  };

  const updateUser = async (req, res, next) => {
    try {
      const updated = await mongoose.model("User").findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true },
      );
      if (!updated) {
        req.rCode = 5;
        req.msg = "User not found";
        return next();
      }
      req.rData = { user: sanitizeUser(updated) };
      req.msg = "User updated successfully";
    } catch (error) {
      req.msg = "Failed to update user";
      req.error = error;
    }
    next();
  };

  const updateUserStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      const updated = await mongoose.model("User").findByIdAndUpdate(
        req.params.id,
        { $set: { status } },
        { new: true },
      );
      if (!updated) {
        req.rCode = 5;
        req.msg = "User not found";
        return next();
      }
      req.rData = { user: sanitizeUser(updated) };
      req.msg = "User status updated successfully";
    } catch (error) {
      req.msg = "Failed to update user status";
      req.error = error;
    }
    next();
  };

  const listDrivers = async (req, res, next) => {
    try {
      let { page = 1, limit = 20, search = "", approvalStatus, status, ridepreference } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const query = {};
      if (search) {
        query.$or = [
          { fullname: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { "vehicle.registrationNumber": { $regex: search, $options: "i" } },
        ];
      }
      if (approvalStatus) query.approvalStatus = approvalStatus;
      if (status) query.status = status;
      if (ridepreference) query.ridepreference = ridepreference;

      const [drivers, total] = await Promise.all([
        mongoose.model("Driver").find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        mongoose.model("Driver").countDocuments(query),
      ]);

      req.rData = {
        drivers: drivers.map(sanitizeDriver),
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Drivers fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch drivers";
      req.error = error;
    }
    next();
  };

  const getDriver = async (req, res, next) => {
    try {
      const driver = await mongoose.model("Driver").findById(req.params.id);
      if (!driver) {
        req.rCode = 5;
        req.msg = "Driver not found";
        return next();
      }
      req.rData = { driver: sanitizeDriver(driver) };
      req.msg = "Driver fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch driver";
      req.error = error;
    }
    next();
  };

  const updateDriver = async (req, res, next) => {
    try {
      const updated = await mongoose.model("Driver").findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true },
      );
      if (!updated) {
        req.rCode = 5;
        req.msg = "Driver not found";
        return next();
      }
      req.rData = { driver: sanitizeDriver(updated) };
      req.msg = "Driver updated successfully";
    } catch (error) {
      req.msg = "Failed to update driver";
      req.error = error;
    }
    next();
  };

  const approveDriver = async (req, res, next) => {
    try {
      const updated = await mongoose.model("Driver").findByIdAndUpdate(
        req.params.id,
        { $set: { ...req.body, approvalStatus: "Approved", isVerified: true } },
        { new: true },
      );
      if (!updated) {
        req.rCode = 5;
        req.msg = "Driver not found";
        return next();
      }
      req.rData = { driver: sanitizeDriver(updated) };
      req.msg = "Driver approved successfully";
    } catch (error) {
      req.msg = "Failed to approve driver";
      req.error = error;
    }
    next();
  };

  const rejectDriver = async (req, res, next) => {
    try {
      const updated = await mongoose.model("Driver").findByIdAndUpdate(
        req.params.id,
        { $set: { ...req.body, approvalStatus: "Rejected", isVerified: false } },
        { new: true },
      );
      if (!updated) {
        req.rCode = 5;
        req.msg = "Driver not found";
        return next();
      }
      req.rData = { driver: sanitizeDriver(updated) };
      req.msg = "Driver rejected successfully";
    } catch (error) {
      req.msg = "Failed to reject driver";
      req.error = error;
    }
    next();
  };

  const updateDriverStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      const updated = await mongoose.model("Driver").findByIdAndUpdate(
        req.params.id,
        { $set: { status } },
        { new: true },
      );
      if (!updated) {
        req.rCode = 5;
        req.msg = "Driver not found";
        return next();
      }
      req.rData = { driver: sanitizeDriver(updated) };
      req.msg = "Driver status updated successfully";
    } catch (error) {
      req.msg = "Failed to update driver status";
      req.error = error;
    }
    next();
  };

  const listDriverReviews = async (req, res, next) => {
    try {
      let { page = 1, limit = 20, rating } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;
      const query = { driverId: req.params.id };
      if (rating) query.rating = parseInt(rating, 10);

      const [reviews, total] = await Promise.all([
        ReviewService().fetchByQuery(query, null, {
          skip,
          limit,
          sort: { createdAt: -1 },
          populate: { path: "userId", select: "fullname profileImage" },
        }),
        ReviewService().count(query),
      ]);

      req.rData = {
        reviews,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Driver reviews fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch driver reviews";
      req.error = error;
    }
    next();
  };

  const driverWallet = async (req, res, next) => {
    try {
      const driverId = new mongoose.Types.ObjectId(req.params.id);
      const rideTotals = await RideService().aggregate([
        { $match: { driverId, status: "completed" } },
        { $group: { _id: null, totalEarnings: { $sum: "$fare" }, totalRides: { $sum: 1 } } },
      ]);
      const cashoutTotals = await CashoutService().aggregate([
        { $match: { driverId, status: { $in: ["Pending", "Approved", "Paid"] } } },
        { $group: { _id: null, totalCashouts: { $sum: "$amount" } } },
      ]);

      const totalEarnings = rideTotals[0]?.totalEarnings || 0;
      const totalRides = rideTotals[0]?.totalRides || 0;
      const totalCashouts = cashoutTotals[0]?.totalCashouts || 0;
      const availableBalance = Math.max(0, totalEarnings - totalCashouts);

      req.rData = {
        totalEarnings,
        totalRides,
        totalCashouts,
        availableBalance,
        currency: "INR",
      };
      req.msg = "Wallet summary fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch wallet summary";
      req.error = error;
    }
    next();
  };

  const driverWalletHistory = async (req, res, next) => {
    try {
      const { kind = "all", page = 1, limit = 20 } = req.query;
      const driverId = req.params.id;
      const currentPage = parseInt(page);
      const perPage = parseInt(limit);
      const skip = (currentPage - 1) * perPage;
      const items = [];

      if (kind === "all" || kind === "rides") {
        const rides = await RideService().fetchByQuery(
          { driverId, status: "completed" },
          null,
          { sort: { completedAt: -1, createdAt: -1 }, limit: perPage * 2 },
        );
        for (const ride of rides) {
          items.push({
            type: "ride",
            id: ride._id,
            amount: ride.fare || 0,
            currency: "INR",
            status: ride.status,
            date: ride.completedAt || ride.updatedAt || ride.createdAt,
            meta: { rideId: ride._id, userId: ride.userId },
          });
        }
      }

      if (kind === "all" || kind === "cashouts") {
        const cashouts = await CashoutService().fetchByQuery(
          { driverId },
          null,
          { sort: { createdAt: -1 }, limit: perPage * 2 },
        );
        for (const cashout of cashouts) {
          items.push({
            type: "cashout",
            id: cashout._id,
            amount: cashout.amount,
            currency: cashout.currency || "INR",
            status: cashout.status,
            date: cashout.createdAt,
            meta: { method: cashout.method },
          });
        }
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const paged = items.slice(skip, skip + perPage);

      req.rData = { items: paged, page: currentPage, limit: perPage, total: items.length };
      req.msg = "Wallet history fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch wallet history";
      req.error = error;
    }
    next();
  };

  const listDriverCashouts = async (req, res, next) => {
    try {
      let { page = 1, limit = 20, status } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;
      const query = { driverId: req.params.id };
      if (status) query.status = status;

      const [cashouts, total] = await Promise.all([
        CashoutService().fetchByQuery(query, null, { skip, limit, sort: { createdAt: -1 } }),
        CashoutService().count(query),
      ]);

      req.rData = {
        cashouts,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Cashouts fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch cashouts";
      req.error = error;
    }
    next();
  };

  const banDriver = async (req, res, next) => {
    try {
      const updated = await mongoose.model("Driver").findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...req.body,
            status: req.body.status || "Inactive",
            approvalStatus: "Rejected",
          },
        },
        { new: true },
      );
      if (!updated) {
        req.rCode = 5;
        req.msg = "Driver not found";
        return next();
      }
      req.rData = { driver: sanitizeDriver(updated) };
      req.msg = "Driver access updated successfully";
    } catch (error) {
      req.msg = "Failed to update driver access";
      req.error = error;
    }
    next();
  };

  const listRides = async (req, res, next) => {
    try {
      let { page = 1, limit = 20, status, userId, driverId, rideType, startDate, endDate } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const query = {};
      if (status) query.status = status;
      if (userId) query.userId = userId;
      if (driverId) query.driverId = driverId;
      if (rideType) query.rideType = rideType;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [rides, total] = await Promise.all([
        RideService().fetchByQuery(query, null, { skip, limit }),
        RideService().countByQuery(query),
      ]);

      req.rData = {
        rides,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Rides fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch rides";
      req.error = error;
    }
    next();
  };

  const getRide = async (req, res, next) => {
    try {
      const ride = await RideService().fetchById(req.params.rideId);
      if (!ride) {
        req.rCode = 5;
        req.msg = "Ride not found";
        return next();
      }
      req.rData = { ride };
      req.msg = "Ride fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch ride";
      req.error = error;
    }
    next();
  };

  const updateRideStatus = async (req, res, next) => {
    try {
      const ride = await RideService().update(
        { _id: req.params.rideId },
        {
          status: req.body.status,
          canceledBy: req.body.canceledBy || null,
          cancelReason: req.body.cancelReason || "",
        },
      );
      if (!ride) {
        req.rCode = 5;
        req.msg = "Ride not found";
        return next();
      }
      req.rData = { ride };
      req.msg = "Ride status updated successfully";
    } catch (error) {
      req.msg = "Failed to update ride status";
      req.error = error;
    }
    next();
  };

  const assignDriverToRide = async (req, res, next) => {
    try {
      const ride = await RideService().update(
        { _id: req.params.rideId },
        { driverId: req.body.driverId, status: "accepted", acceptedAt: new Date() },
      );
      if (!ride) {
        req.rCode = 5;
        req.msg = "Ride not found";
        return next();
      }
      req.rData = { ride };
      req.msg = "Driver assigned successfully";
    } catch (error) {
      req.msg = "Failed to assign driver";
      req.error = error;
    }
    next();
  };

  const cancelRide = async (req, res, next) => {
    try {
      const ride = await RideService().update(
        { _id: req.params.rideId },
        {
          status: "canceled",
          canceledBy: "admin",
          cancelReason: req.body.cancelReason || "",
        },
      );
      if (!ride) {
        req.rCode = 5;
        req.msg = "Ride not found";
        return next();
      }
      req.rData = { ride };
      req.msg = "Ride canceled successfully";
    } catch (error) {
      req.msg = "Failed to cancel ride";
      req.error = error;
    }
    next();
  };

  const listCashouts = async (req, res, next) => {
    try {
      let { page = 1, limit = 20, status, driverId } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;
      const query = {};
      if (status) query.status = status;
      if (driverId) query.driverId = driverId;

      const [cashouts, total] = await Promise.all([
        CashoutService().fetchByQuery(query, null, { skip, limit, sort: { createdAt: -1 } }),
        CashoutService().count(query),
      ]);

      req.rData = {
        cashouts,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Cashouts fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch cashouts";
      req.error = error;
    }
    next();
  };

  const getCashout = async (req, res, next) => {
    try {
      const cashout = await CashoutService().fetchOne({ _id: req.params.id });
      if (!cashout) {
        req.rCode = 5;
        req.msg = "Cashout not found";
        return next();
      }
      req.rData = { cashout };
      req.msg = "Cashout fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch cashout";
      req.error = error;
    }
    next();
  };

  const approveCashout = async (req, res, next) => {
    try {
      const cashout = await CashoutService().findOneAndUpdate(
        { _id: req.params.id, status: "Pending" },
        { $set: { status: "Approved", processedAt: new Date(), note: req.body.note || "" } },
      );
      if (!cashout) {
        req.rCode = 0;
        req.msg = "Cashout cannot be approved";
        return next();
      }
      req.rData = { cashout };
      req.msg = "Cashout approved successfully";
    } catch (error) {
      req.msg = "Failed to approve cashout";
      req.error = error;
    }
    next();
  };

  const rejectCashout = async (req, res, next) => {
    try {
      const cashout = await CashoutService().findOneAndUpdate(
        { _id: req.params.id, status: "Pending" },
        { $set: { status: "Rejected", processedAt: new Date(), rejectionReason: req.body.reason || "" } },
      );
      if (!cashout) {
        req.rCode = 0;
        req.msg = "Cashout cannot be rejected";
        return next();
      }
      req.rData = { cashout };
      req.msg = "Cashout rejected successfully";
    } catch (error) {
      req.msg = "Failed to reject cashout";
      req.error = error;
    }
    next();
  };

  const markCashoutPaid = async (req, res, next) => {
    try {
      const cashout = await CashoutService().findOneAndUpdate(
        { _id: req.params.id, status: { $in: ["Approved", "Pending"] } },
        { $set: { status: "Paid", processedAt: new Date(), paymentRef: req.body.referenceNumber || "" } },
      );
      if (!cashout) {
        req.rCode = 0;
        req.msg = "Cashout cannot be marked paid";
        return next();
      }
      req.rData = { cashout };
      req.msg = "Cashout marked as paid successfully";
    } catch (error) {
      req.msg = "Failed to mark cashout paid";
      req.error = error;
    }
    next();
  };

  const listReviews = async (req, res, next) => {
    try {
      let { page = 1, limit = 20, rating, driverId, userId } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;
      const query = {};
      if (rating) query.rating = parseInt(rating, 10);
      if (driverId) query.driverId = driverId;
      if (userId) query.userId = userId;

      const [reviews, total] = await Promise.all([
        ReviewService().fetchByQuery(query, null, { skip, limit, sort: { createdAt: -1 } }),
        ReviewService().count(query),
      ]);

      req.rData = {
        reviews,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Reviews fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch reviews";
      req.error = error;
    }
    next();
  };

  const getReview = async (req, res, next) => {
    try {
      const review = await ReviewService().fetchOne({ _id: req.params.id });
      if (!review) {
        req.rCode = 5;
        req.msg = "Review not found";
        return next();
      }
      req.rData = { review };
      req.msg = "Review fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch review";
      req.error = error;
    }
    next();
  };

  const deleteReview = async (req, res, next) => {
    try {
      const deleted = await mongoose.model("Review").findByIdAndDelete(req.params.id);
      if (!deleted) {
        req.rCode = 5;
        req.msg = "Review not found";
        return next();
      }
      req.rData = { review: deleted };
      req.msg = "Review deleted successfully";
    } catch (error) {
      req.msg = "Failed to delete review";
      req.error = error;
    }
    next();
  };

  const listPaymentMethods = async (req, res, next) => {
    try {
      let { page = 1, limit = 20, userId } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;
      const query = {};
      if (userId) query.userId = userId;

      const PaymentMethod = mongoose.model("PaymentMethod");
      const [paymentMethods, total] = await Promise.all([
        PaymentMethod.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        PaymentMethod.countDocuments(query),
      ]);

      req.rData = {
        paymentMethods,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Payment methods fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch payment methods";
      req.error = error;
    }
    next();
  };

  return {
    login,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    changePassword,
    me,
    logout,
    dashboardSummary,
    dashboardEarnings,
    listUsers,
    getUser,
    updateUser,
    updateUserStatus,
    listDrivers,
    getDriver,
    updateDriver,
    approveDriver,
    rejectDriver,
    updateDriverStatus,
    listDriverReviews,
    driverWallet,
    driverWalletHistory,
    listDriverCashouts,
    banDriver,
    listRides,
    getRide,
    updateRideStatus,
    assignDriverToRide,
    cancelRide,
    listCashouts,
    getCashout,
    approveCashout,
    rejectCashout,
    markCashoutPaid,
    listReviews,
    getReview,
    deleteReview,
    listPaymentMethods,
  };
};
