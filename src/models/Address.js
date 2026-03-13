const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    houseNo: { type: String, required: true },
    landmark: { type: String },
    customerInstructions: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    addressType: { type: String, enum: ["Home", "Work", "Near Metro"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);