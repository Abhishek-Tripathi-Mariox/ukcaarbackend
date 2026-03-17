const Review = require("../models/Review");

module.exports = () => {
  const create = async (data) => {
    try {
      const review = new Review(data);
      return await review.save();
    } catch (error) {
      console.error("Error creating review", { error: error.message });
      throw error;
    }
  };

  const fetchOne = async (query) => {
    try {
      return await Review.findOne(query);
    } catch (error) {
      console.error("Error fetching review", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchByQuery = async (query, projection = null, options = {}) => {
    try {
      const { skip, limit, sort, populate } = options || {};
      let q = Review.find(query, projection);
      if (sort) q = q.sort(sort);
      if (skip !== undefined) q = q.skip(skip);
      if (limit !== undefined) q = q.limit(limit);
      if (populate) q = q.populate(populate);
      return await q;
    } catch (error) {
      console.error("Error fetching reviews", { error: error.message });
      throw new Error("Database error");
    }
  };

  const count = async (query = {}) => {
    try {
      return await Review.countDocuments(query);
    } catch (error) {
      console.error("Error counting reviews", { error: error.message });
      throw new Error("Database error");
    }
  };

  const aggregate = async (pipeline) => {
    try {
      return await Review.aggregate(pipeline);
    } catch (error) {
      console.error("Error aggregating reviews", { error: error.message });
      throw new Error("Database error");
    }
  };

  return {
    create,
    fetchOne,
    fetchByQuery,
    count,
    aggregate,
  };
};

