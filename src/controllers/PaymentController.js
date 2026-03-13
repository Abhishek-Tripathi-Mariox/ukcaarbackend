const PaymentService = require("../services/PaymentService");

module.exports = () => {
  
  const addPaymentMethod = async (req, res, next) => {
    try {
      const { userId } = req.body; // Extracted by verifyUserToken middleware
      const { cardName, cardNumber, expiryDate, cvc, zipCode } = req.body;

      // Add a new payment method
      const paymentMethod = await PaymentService().create({
        userId,
        cardName,
        cardNumber,
        expiryDate,
        cvc,
        zipCode,
      });

      req.rData = { paymentMethod };
      req.msg = "Payment method added successfully";
    } catch (error) {
      req.msg = "Failed to add payment method";
      req.error = error;
    }
    next();
  };

  const getPaymentMethods = async (req, res, next) => {
    try {
      const { userId } = req.body; // Extracted by verifyUserToken middleware

      // Fetch all payment methods for the user
      const paymentMethods = await PaymentService().fetchByQuery({ userId });

      req.rData = { paymentMethods };
      req.msg = "Payment methods fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch payment methods";
      req.error = error;
    }
    next();
  };

  return {
    addPaymentMethod,
    getPaymentMethods,
  };
};