const PaymentMethod = require("../models/PaymentMethod.js");

module.exports = () => {
  const create = async (data) => {
    try {
      const paymentMethod = new PaymentMethod(data);
      return await paymentMethod.save();
    } catch (error) {
      console.error("Error creating payment method", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchByQuery = async (query) => {
    try {
      return await PaymentMethod.find(query);
    } catch (error) {
      console.error("Error fetching payment methods by query", { error: error.message });
      throw new Error("Database error");
    }
  };

  return {
    create,
    fetchByQuery,
  };
};