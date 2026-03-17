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

  const update = async (query, data) => {
    try {
      const hasOperator = data && Object.keys(data).some((k) => k.startsWith("$"));
      const normalizedUpdate = hasOperator ? data : { $set: data };
      return await Address.findOneAndUpdate(query, normalizedUpdate, { new: true });
    } catch (error) {
      console.error("Error updating address", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchOne = async (query) => {
    try {
      return await Address.findOne(query);
    } catch (error) {
      console.error("Error fetching address", { error: error.message });
      throw new Error("Database error");
    }
  };

  return {
    create,
    fetchByQuery,
    deleteAddress,
    update,
    fetchOne,
  };
};
