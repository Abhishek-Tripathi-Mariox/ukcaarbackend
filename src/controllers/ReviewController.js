const mongoose = require("mongoose");
const RideService = require("../services/RideService");
const ReviewService = require("../services/ReviewService");

module.exports = () => {
  const submitReview = async (req, res, next) => {
    try {
      const { userId, rideId, rating, comment } = req.body;

      const ride = await RideService().fetchOne({
        _id: rideId,
        userId,
        status: "completed",
      });

      if (!ride) {
        req.rCode = 5;
        req.msg = "Ride not found";
        return next();
      }

      if (!ride.driverId) {
        req.rCode = 0;
        req.msg = "Driver not assigned";
        return next();
      }

      const existing = await ReviewService().fetchOne({ rideId, userId });
      if (existing) {
        req.rCode = 0;
        req.msg = "Review already submitted";
        return next();
      }

      const review = await ReviewService().create({
        rideId,
        userId,
        driverId: ride.driverId,
        rating: parseInt(rating, 10),
        comment: comment || "",
      });

      req.rData = { review };
      req.msg = "Review submitted successfully";
    } catch (error) {
      if (error && error.code === 11000) {
        req.rCode = 0;
        req.msg = "Review already submitted";
        return next();
      }
      req.msg = "Failed to submit review";
      req.error = error;
    }
    next();
  };

  const getDriverReviews = async (req, res, next) => {
    try {
      const { driverId } = req.body;
      let { page = 1, limit = 10, rating } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const query = { driverId };
      if (rating) query.rating = parseInt(rating);

      const reviews = await ReviewService().fetchByQuery(query, null, {
        skip,
        limit,
        sort: { createdAt: -1 },
        populate: { path: "userId", select: "fullname profileImage" },
      });

      const total = await ReviewService().count(query);

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

  const getDriverRatingSummary = async (req, res, next) => {
    try {
      const { driverId } = req.body;
      const driverObjectId = new mongoose.Types.ObjectId(driverId);

      const rows = await ReviewService().aggregate([
        { $match: { driverId: driverObjectId } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      const total = rows.reduce((acc, r) => acc + r.count, 0);
      const sumWeighted = rows.reduce((acc, r) => acc + r._id * r.count, 0);
      const average = total ? sumWeighted / total : 0;

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const r of rows) distribution[r._id] = r.count;

      req.rData = {
        totalReviews: total,
        averageRating: Number(average.toFixed(2)),
        distribution,
      };
      req.msg = "Driver rating summary fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch driver rating summary";
      req.error = error;
    }
    next();
  };

  return {
    submitReview,
    getDriverReviews,
    getDriverRatingSummary,
  };
};

