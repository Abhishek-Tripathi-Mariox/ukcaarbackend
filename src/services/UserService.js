const User = require("../models/User.js");

module.exports = () => {
  const fetchByQuery = async (query) => {
    try {
      return await User.findOne(query);
    } catch (error) {
      console.error("Error fetching user by query", { error: error.message });
      throw new Error("Database error");
    }
  };

  const create = async (userData) => {
    try {
      const user = new User(userData);

      // Generate a referral code based on the user's ID
      user.referralCode = `REF${user._id.toString().slice(-6).toUpperCase()}`;

      await user.save();
      return user;
    } catch (error) {
      console.error("Error creating user", { error: error.message });
      throw new Error("Database error");
    }
  };

  const update = async (query, data) => {
    try {
      const hasOperator = data && Object.keys(data).some((k) => k.startsWith("$"));
      const normalizedUpdate = hasOperator ? data : { $set: data };
      return await User.findOneAndUpdate(query, normalizedUpdate, { new: true });
    } catch (error) {
      console.error("Error updating user", { error: error.message });
      throw new Error("Database error");
    }
  };

  return {
    fetchByQuery,
    create,
    update,
  };
};
