const Ride = require("../models/Ride.js");

module.exports = () => {
  const create = async (data) => {
    try {
      const ride = new Ride(data);
      return await ride.save();
    } catch (error) {
      console.error("Error creating ride", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchByQuery = async (query, projection = null, options = {}) => {
    try {
      const { skip, limit, sort } = options || {};
      let q = Ride.find(query, projection);
      if (skip !== undefined) q = q.skip(skip);
      if (limit !== undefined) q = q.limit(limit);
      // Default sort by most recent rides unless caller overrides or query uses $near
      if (sort) {
        q = q.sort(sort);
      } else if (!query || !query.pickupLocation || !query.pickupLocation.$near) {
        q = q.sort({ createdAt: -1 });
      }
      return await q;
    } catch (error) {
      console.error("Error fetching rides by query", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchOne = async (query, projection = null, options = {}) => {
    try {
      const { sort } = options || {};
      let q = Ride.findOne(query, projection);
      if (sort) q = q.sort(sort);
      return await q;
    } catch (error) {
      console.error("Error fetching ride", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchById = async (id) => {
    try {
      return await Ride.findById(id);
    } catch (error) {
      console.error("Error fetching ride by id", { error: error.message });
      throw new Error("Database error");
    }
  };

  const scheduleRide = async (data) => {
    try {
      const ride = new Ride(data);
      return await ride.save();
    } catch (error) {
      console.error("Error scheduling ride", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchScheduledRides = async (query) => {
    try {
      return await Ride.find({ ...query, status: "scheduled" }).sort({
        scheduledTime: 1,
      }); // Sort by scheduled time
    } catch (error) {
      console.error("Error fetching scheduled rides", { error: error.message });
      throw new Error("Database error");
    }
  };

  const assignDriver = async (rideId, driverId) => {
    try {
      return await Ride.findOneAndUpdate(
        {
          _id: rideId,
          driverId: null,
          status: { $in: ["requested", "booked", "scheduled"] },
        },
        { $set: { driverId, status: "accepted", acceptedAt: new Date() } },
        { new: true }
      );
    } catch (error) {
      console.error("Error assigning driver to ride", { error: error.message });
      throw new Error("Database error");
    }
  };

  const countByQuery = async (query) => {
    try {
      return await Ride.countDocuments(query);
    } catch (error) {
      throw new Error("Failed to count rides: " + error.message);
    }
  };

  const update = async (query, updateData) => {
    try {
      const hasOperator = updateData && Object.keys(updateData).some((k) => k.startsWith("$"));
      const normalizedUpdate = hasOperator ? updateData : { $set: updateData };
      return await Ride.findOneAndUpdate(query, normalizedUpdate, { new: true });
    } catch (error) {
      console.error("Error updating ride", { error: error.message });
      throw new Error("Database error");
    }
  };

  const findOneAndUpdate = async (query, updateData, options = {}) => {
    try {
      return await Ride.findOneAndUpdate(query, updateData, { new: true, ...options });
    } catch (error) {
      console.error("Error in findOneAndUpdate ride", { error: error.message });
      throw new Error("Database error");
    }
  };

  const aggregate = async (pipeline) => {
    try {
      return await Ride.aggregate(pipeline);
    } catch (error) {
      console.error("Error aggregating rides", { error: error.message });
      throw new Error("Database error");
    }
  };
  const fetchAll = async (query = {}) => {
    try {
      return await Ride.find(query)
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error fetching rides", { error: error.message });
      throw new Error("Database error");
    }
  } 

  const count = async (query = {}) => {
    try {
      return await Ride.countDocuments(query);
    } catch (error) {
      console.error("Error counting rides", { error: error.message });
      throw new Error("Database error");
    }
  }

  return {
    create,
    fetchByQuery,
    fetchOne,
    fetchById,
    scheduleRide,
    fetchScheduledRides,
    assignDriver,
    countByQuery,
    update,
    findOneAndUpdate,
    aggregate,
    fetchAll
  };
};
