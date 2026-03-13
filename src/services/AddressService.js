const Address = require("../models/Address.js");

module.exports = () => {
  const create = async (data) => {
    try {
      const address = new Address(data);
      return await address.save();
    } catch (error) {
      console.error("Error creating address", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchByQuery = async (query) => {
    try {
      return await Address.find(query);
    } catch (error) {
      console.error("Error fetching addresses by query", { error: error.message });
      throw new Error("Database error");
    }
  };

  const deleteAddress = async (query) => {
    try {
      return await Address.findOneAndDelete(query);
    } catch (error) {
      console.error("Error deleting address", { error: error.message });
      throw new Error("Database error");
    }
  };

  return {
    create,
    fetchByQuery,
    deleteAddress,
  };
};