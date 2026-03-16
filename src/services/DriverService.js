const Driver = require("../models/Driver.js");

module.exports = () => {

  const fetchByQuery = async (query) => {
    try {
      return await Driver.findOne(query);
    } catch (error) {
      console.error("Error fetching driver by query", { error: error.message });
      throw new Error("Database error");
    }
  };

  const create = async (userData) => {
    try {
      const user = new Driver(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error("Error creating driver", { error: error.message });
      throw new Error("Database error");
    }
  };


  const update = async (query, data) => {
    try {
      return await Driver.findOneAndUpdate(query, data, { new: true });
    } catch (error) {
      console.error("Error updating driver", { error: error.message });
      throw new Error("Database error");
    }
  };

  return {
    fetchByQuery,
    create,
    update,
  };
};