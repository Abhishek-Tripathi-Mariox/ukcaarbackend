const CashoutRequest = require("../models/CashoutRequest");

module.exports = () => {
  const create = async (data) => {
    try {
      const req = new CashoutRequest(data);
      return await req.save();
    } catch (error) {
      console.error("Error creating cashout request", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchByQuery = async (query, projection = null, options = {}) => {
    try {
      const { skip, limit, sort } = options || {};
      let q = CashoutRequest.find(query, projection);
      if (sort) q = q.sort(sort);
      if (skip !== undefined) q = q.skip(skip);
      if (limit !== undefined) q = q.limit(limit);
      return await q;
    } catch (error) {
      console.error("Error fetching cashout requests", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchOne = async (query) => {
    try {
      return await CashoutRequest.findOne(query);
    } catch (error) {
      console.error("Error fetching cashout request", { error: error.message });
      throw new Error("Database error");
    }
  };

  const findOneAndUpdate = async (query, updateData, options = {}) => {
    try {
      return await CashoutRequest.findOneAndUpdate(query, updateData, {
        new: true,
        ...options,
      });
    } catch (error) {
      console.error("Error updating cashout request", { error: error.message });
      throw new Error("Database error");
    }
  };

  const count = async (query = {}) => {
    try {
      return await CashoutRequest.countDocuments(query);
    } catch (error) {
      console.error("Error counting cashout requests", { error: error.message });
      throw new Error("Database error");
    }
  };

  const aggregate = async (pipeline) => {
    try {
      return await CashoutRequest.aggregate(pipeline);
    } catch (error) {
      console.error("Error aggregating cashout requests", { error: error.message });
      throw new Error("Database error");
    }
  };

  return {
    create,
    fetchByQuery,
    fetchOne,
    findOneAndUpdate,
    count,
    aggregate,
  };
};

