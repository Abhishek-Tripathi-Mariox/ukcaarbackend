const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CashoutRequestSchema = new Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Paid", "Cancelled"],
      default: "Pending",
    },
    method: { type: String, enum: ["Bank"], default: "Bank" },
    note: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

CashoutRequestSchema.index({ driverId: 1, createdAt: -1 });
CashoutRequestSchema.index({ driverId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("CashoutRequest", CashoutRequestSchema);

