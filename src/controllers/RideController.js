const RideService = require("../services/RideService");
const DriverService = require("../services/DriverService");

module.exports = () => {
  const generate4DigitOtp = () => `${Math.floor(1000 + Math.random() * 9000)}`;
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
        status: "requested",
        pickupOtp: generate4DigitOtp(),
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
        { _id: rideId, userId, status: { $in: ["requested", "scheduled", "accepted", "booked", "arrived"] } },
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
        pickupOtp: generate4DigitOtp(),
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
  const getCurrentRide = async (req, res, next) => {
    try {
      const { userId } = req.body;
      const ride = await RideService().fetchOne(
        { userId, status: { $in: ["requested", "scheduled", "accepted", "arrived", "started", "booked"] } },
        null,
        { sort: { updatedAt: -1 } },
      );
      req.rData = { ride };
      req.msg = "Current ride fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch current ride";
      req.error = error;
    }
    next();
  };

  const getRideDetails = async (req, res, next) => {
    try {
      const { userId } = req.body;
      const { rideId } = req.params;

      const ride = await RideService().fetchOne({ _id: rideId, userId });
      if (!ride) {
        req.rCode = 5;
        req.msg = "Ride not found";
        return next();
      }

      req.rData = { ride };
      req.msg = "Ride details fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch ride details";
      req.error = error;
    }
    next();
  };

  const getFareEstimate = async (req, res, next) => {
    try {
      const { pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, rideType } = req.query;

      const pLat = parseFloat(pickupLatitude);
      const pLng = parseFloat(pickupLongitude);
      const dLat = parseFloat(dropoffLatitude);
      const dLng = parseFloat(dropoffLongitude);

      if ([pLat, pLng, dLat, dLng].some((v) => Number.isNaN(v))) {
        req.rCode = 0;
        req.msg = "Invalid coordinates";
        return next();
      }

      const km = haversineKm(pLat, pLng, dLat, dLng);
      const type = (rideType || "Economy").toString();

      const pricing = {
        Economy: { base: 40, perKm: 12 },
        Comfort: { base: 60, perKm: 16 },
        Premium: { base: 80, perKm: 20 },
      };
      const p = pricing[type] || pricing.Economy;

      const fare = Math.round(p.base + km * p.perKm);

      req.rData = { distanceKm: Number(km.toFixed(2)), estimatedFare: fare, currency: "INR", rideType: type };
      req.msg = "Fare estimate fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch fare estimate";
      req.error = error;
    }
    next();
  };

  const getAvailableDrivers = async (req, res, next) => {
    try {
      const { latitude, longitude, maxDistanceMeters } = req.query;

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if ([lat, lng].some((v) => Number.isNaN(v))) {
        req.rCode = 0;
        req.msg = "Invalid coordinates";
        return next();
      }

      const maxDistance = maxDistanceMeters ? parseInt(maxDistanceMeters) : 5000;

      const drivers = await DriverService().fetchAll(
        {
          status: "Active",
          currentLocation: {
            $near: {
              $geometry: { type: "Point", coordinates: [lng, lat] },
              $maxDistance: maxDistance,
            },
          },
        },
        0,
        50,
      );

      req.rData = { drivers };
      req.msg = "Available drivers fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch available drivers";
      req.error = error;
    }
    next();
  };

  const getRideReceipt = async (req, res, next) => {
    try {
      const { userId } = req.body;
      const { rideId } = req.params;

      const ride = await RideService().fetchOne({ _id: rideId, userId });
      if (!ride) {
        req.rCode = 5;
        req.msg = "Ride not found";
        return next();
      }

      req.rData = {
        receipt: {
          rideId: ride._id,
          status: ride.status,
          rideType: ride.rideType,
          fare: ride.fare || 0,
          distanceKm: ride.distanceKm || 0,
          durationMin: ride.durationMin || 0,
          paymentStatus: ride.paymentStatus || "unpaid",
          paidAt: ride.paidAt,
          createdAt: ride.createdAt,
          completedAt: ride.completedAt,
        },
      };
      req.msg = "Ride receipt fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch receipt";
      req.error = error;
    }
    next();
  };

  const markRidePaid = async (req, res, next) => {
    try {
      const { userId, rideId, paymentMethodId, paymentRef } = req.body;

      const updatedRide = await RideService().findOneAndUpdate(
        { _id: rideId, userId, status: { $in: ["completed", "booked", "started"] } },
        {
          $set: {
            paymentStatus: "paid",
            paymentMethodId: paymentMethodId || null,
            paymentRef: paymentRef || "",
            paidAt: new Date(),
          },
        },
      );

      if (!updatedRide) {
        req.rCode = 0;
        req.msg = "Payment cannot be marked";
        return next();
      }

      req.rData = { ride: updatedRide };
      req.msg = "Payment marked successfully";
    } catch (error) {
      req.msg = "Failed to mark payment";
      req.error = error;
    }
    next();
  };

  const emergencySos = async (req, res, next) => {
    try {
      const { userId, rideId, message, latitude, longitude } = req.body;
      console.log("USER_EMERGENCY_SOS", {
        userId,
        rideId,
        message,
        latitude,
        longitude,
        at: new Date().toISOString(),
      });
      req.rData = { ok: true };
      req.msg = "Emergency SOS received";
    } catch (error) {
      req.msg = "Failed to send SOS";
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
    getCurrentRide,
    getRideDetails,
    getFareEstimate,
    getAvailableDrivers,
    getRideReceipt,
    markRidePaid,
    emergencySos,
  };
};