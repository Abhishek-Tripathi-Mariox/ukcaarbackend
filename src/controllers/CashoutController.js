const mongoose = require("mongoose");
const DriverService = require("../services/DriverService");
const RideService = require("../services/RideService");
const CashoutService = require("../services/CashoutService");

module.exports = () => {
  
  const getWalletSummary = async (req, res, next) => {
    try {
      const { driverId } = req.body;
      const driverObjectId = new mongoose.Types.ObjectId(driverId);

      const rideTotals = await RideService().aggregate([
        { $match: { driverId: driverObjectId, status: "completed" } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$fare" },
            totalRides: { $sum: 1 },
          },
        },
      ]);

      const cashoutTotals = await CashoutService().aggregate([
        {
          $match: {
            driverId: driverObjectId,
            status: { $in: ["Pending", "Approved", "Paid"] },
          },
        },
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

  const requestCashout = async (req, res, next) => {
    try {
      const { driverId, amount, note } = req.body;
      const driverObjectId = new mongoose.Types.ObjectId(driverId);

      const driver = await DriverService().fetchByQuery({ _id: driverId });
      if (!driver) {
        req.rCode = 5;
        req.msg = "Driver not found";
        return next();
      }

      const bank = driver.bankDetails || {};
      if (!bank.accountNumber || !bank.ifscCode) {
        req.rCode = 0;
        req.msg = "Bank details required";
        return next();
      }

      const wallet = await RideService().aggregate([
        { $match: { driverId: driverObjectId, status: "completed" } },
        { $group: { _id: null, totalEarnings: { $sum: "$fare" } } },
      ]);

      const cashoutTotals = await CashoutService().aggregate([
        {
          $match: {
            driverId: driverObjectId,
            status: { $in: ["Pending", "Approved", "Paid"] },
          },
        },
        { $group: { _id: null, totalCashouts: { $sum: "$amount" } } },
      ]);

      const totalEarnings = wallet[0]?.totalEarnings || 0;
      const totalCashouts = cashoutTotals[0]?.totalCashouts || 0;
      const availableBalance = Math.max(0, totalEarnings - totalCashouts);

      const reqAmount = parseFloat(amount);
      if (!reqAmount || reqAmount <= 0) {
        req.rCode = 0;
        req.msg = "Invalid amount";
        return next();
      }

      if (reqAmount > availableBalance) {
        req.rCode = 0;
        req.msg = "Insufficient balance";
        req.rData = { availableBalance };
        return next();
      }

      const cashout = await CashoutService().create({
        driverId,
        amount: reqAmount,
        currency: "INR",
        method: "Bank",
        note: note || "",
        status: "Pending",
      });

      req.rData = { cashout, availableBalanceAfter: availableBalance - reqAmount };
      req.msg = "Cashout request submitted";
    } catch (error) {
      req.msg = "Failed to submit cashout request";
      req.error = error;
    }
    next();
  };

  const getCashoutHistory = async (req, res, next) => {
    try {
      const { driverId } = req.body;
      let { page = 1, limit = 10, status } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const query = { driverId };
      if (status) query.status = status;

      const cashouts = await CashoutService().fetchByQuery(query, null, {
        skip,
        limit,
        sort: { createdAt: -1 },
      });
      const total = await CashoutService().count(query);

      req.rData = {
        cashouts,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
      req.msg = "Cashout history fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch cashout history";
      req.error = error;
    }
    next();
  };

  const cancelCashoutRequest = async (req, res, next) => {
    try {
      const { driverId, cashoutId } = req.body;

      const updated = await CashoutService().findOneAndUpdate(
        { _id: cashoutId, driverId, status: "Pending" },
        { $set: { status: "Cancelled", processedAt: new Date() } },
      );

      if (!updated) {
        req.rCode = 0;
        req.msg = "Cashout cannot be cancelled";
        return next();
      }

      req.rData = { cashout: updated };
      req.msg = "Cashout cancelled successfully";
    } catch (error) {
      req.msg = "Failed to cancel cashout";
      req.error = error;
    }
    next();
  };

  const getWalletHistory = async (req, res, next) => {
    try {
      const { driverId } = req.body;
      let { page = 1, limit = 10, kind } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const items = [];

      const includeRides = !kind || kind === "all" || kind === "rides";
      const includeCashouts = !kind || kind === "all" || kind === "cashouts";

      if (includeRides) {
        const rides = await RideService().fetchByQuery(
          { driverId, status: "completed" },
          null,
          { sort: { completedAt: -1, createdAt: -1 }, limit: limit * 2 },
        );
        for (const r of rides) {
          items.push({
            type: "ride",
            id: r._id,
            amount: r.fare || 0,
            currency: "INR",
            status: r.status,
            date: r.completedAt || r.updatedAt || r.createdAt,
            meta: { rideId: r._id, userId: r.userId },
          });
        }
      }

      if (includeCashouts) {
        const cashouts = await CashoutService().fetchByQuery(
          { driverId },
          null,
          { sort: { createdAt: -1 }, limit: limit * 2 },
        );
        for (const c of cashouts) {
          items.push({
            type: "cashout",
            id: c._id,
            amount: c.amount,
            currency: c.currency || "INR",
            status: c.status,
            date: c.createdAt,
            meta: { method: c.method },
          });
        }
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const paged = items.slice(skip, skip + limit);

      req.rData = { items: paged, page, limit, total: items.length };
      req.msg = "Wallet history fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch wallet history";
      req.error = error;
    }
    next();
  };

  return {
    getWalletSummary,
    requestCashout,
    getCashoutHistory,
    cancelCashoutRequest,
    getWalletHistory,
  };
};

