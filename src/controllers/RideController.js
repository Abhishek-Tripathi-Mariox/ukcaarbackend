const RideService = require("../services/RideService");

module.exports = () => {
  const bookRide = async (req, res, next) => {
    try {
      const { userId, pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, rideType } = req.body;

      let pickupLocation, dropoffLocation;

      if (pickupLatitude && pickupLongitude) {
        pickupLocation = {
          type: "Point",
          coordinates: [parseFloat(pickupLongitude), parseFloat(pickupLatitude)],
        };
      }

      if (dropoffLatitude && dropoffLongitude) {
        dropoffLocation = {
          type: "Point",
          coordinates: [parseFloat(dropoffLongitude), parseFloat(dropoffLatitude)],
        };
      }

      // Book a new ride
      const ride = await RideService().create({
        userId,
        pickupLocation,
        dropoffLocation,
        rideType,
        status: "booked",
      });

      req.rData = { ride };
      req.msg = "Ride booked successfully";
    } catch (error) {
      req.msg = "Failed to book ride";
      req.error = error;
    }
    next();
  };

  const getRideHistory = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, status,  } = req.query;
    let userId= req.body.userId; // Extracted by verifyUserToken middleware
    // Convert to proper types
    page = parseInt(page);
    limit = parseInt(limit);

    if (!userId) {
      req.msg = "userId is required";
      return next();
    }

    if (status) {
      status = status.toLowerCase();
    }

    const skip = (page - 1) * limit;

    const query = { userId };

    if (status) {
      query.status = status;
    }

    console.log("Fetching ride history with query:", query, "skip:", skip, "limit:", limit);

    const totalRides = await RideService().countByQuery(query);

    const rides = await RideService().fetchByQuery(query, null, { skip, limit });

    req.rData = { rides, page, limit, totalRides };
    req.msg = "Ride history fetched successfully";

  } catch (error) {
    console.error("Error fetching ride history", error);
    req.msg = "Failed to fetch ride history";
    req.error = error;
  }
  next();
};
  const cancelRide = async (req, res, next) => {
    try {
      const { userId, rideId, cancelReason, canceledBy } = req.body;

      if (!canceledBy || !['user', 'driver', 'admin'].includes(canceledBy)) {
        req.msg = "Invalid 'canceledBy' value. Must be 'user', 'driver', or 'admin'.";
        return next();
      }

      // Cancel the ride
      const updatedRide = await RideService().update(
        { _id: rideId, userId, status: "booked" },
        { status: "canceled", cancelReason, canceledBy }
      );

      if (!updatedRide) {
        req.msg = "Ride not found or cannot be canceled";
        return next();
      }

      req.rData = { ride: updatedRide };
      req.msg = `Ride canceled successfully by ${canceledBy}`;
    } catch (error) {
      console.error("Error canceling ride", error);
      req.msg = "Failed to cancel ride";
      req.error = error;
    }
    next();
  };

  const scheduleRide = async (req, res, next) => {
    try {
      const { userId, pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, rideType, scheduledTime } = req.body;

      let pickupLocation, dropoffLocation;

      if (pickupLatitude && pickupLongitude) {
        pickupLocation = {
          type: "Point",
          coordinates: [parseFloat(pickupLongitude), parseFloat(pickupLatitude)],
        };
      }

      if (dropoffLatitude && dropoffLongitude) {
        dropoffLocation = {
          type: "Point",
          coordinates: [parseFloat(dropoffLongitude), parseFloat(dropoffLatitude)],
        };
      }

      // Schedule a new ride
      const ride = await RideService().scheduleRide({
        userId,
        pickupLocation,
        dropoffLocation,
        rideType,
        status: "scheduled",
        scheduledTime,
      });

      req.rData = { ride };
      req.msg = "Ride scheduled successfully";
    } catch (error) {
      req.msg = "Failed to schedule ride";
      req.error = error;
    }
    next();
  };

  const acceptRide = async (req, res, next) => {
    try {
      const { rideId, driverId } = req.body;

      // Assign driver to the ride
      const updatedRide = await RideService().assignDriver(rideId, driverId);

      if (!updatedRide) {
        req.msg = "Ride not found or already accepted";
        return next();
      }

      req.rData = { ride: updatedRide };
      req.msg = "Ride accepted successfully";
    } catch (error) {
      req.msg = "Failed to accept ride";
      req.error = error;
    }
    next();
  };

  return {
    bookRide,
    getRideHistory,
    cancelRide,
    scheduleRide,
    acceptRide,
  };
};