const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentMethodSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cardName: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvc: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", PaymentMethodSchema);