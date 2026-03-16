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

  const fetchByQuery = async (query) => {
    try {
      return await Ride.find(query).sort({ createdAt: -1 }); // Sort by most recent rides
    } catch (error) {
      console.error("Error fetching rides by query", { error: error.message });
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
      return await Ride.findByIdAndUpdate(
        rideId,
        { driverId, status: "booked" },
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
      return await Ride.findOneAndUpdate(query, updateData, {
        returnDocument: "after",
      });
    } catch (error) {
      console.error("Error updating ride", { error: error.message });
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
    scheduleRide,
    fetchScheduledRides,
    assignDriver,
    countByQuery,
    update,
    fetchAll
  };
};