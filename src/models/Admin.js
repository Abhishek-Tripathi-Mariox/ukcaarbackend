const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: "", unique: true, sparse: true },
    role: { type: String, default: "SuperAdmin" },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    resetOtp: { type: String, default: "" },
    resetOtpExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", AdminSchema);
