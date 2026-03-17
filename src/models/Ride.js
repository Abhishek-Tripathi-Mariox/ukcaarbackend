const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RideSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pickupLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    dropoffLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    rideType: {
      type: String,
      enum: ["Economy", "Premium", "Comfort"],
      required: true,
    },
    status: {
      type: String,
      // keep "booked" for backward compatibility
      enum: [
        "requested",
        "accepted",
        "arrived",
        "started",
        "booked",
        "completed",
        "canceled",
        "scheduled",
      ],
      default: "requested",
    },
    canceledBy: {
      type: String,
      enum: ["user", "driver", "admin", null],
      default: null,
    },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver",default: null },
    fare: { type: Number,default: 0 },   
    scheduledTime: { type: Date , default: null }, 
    cancelReason: { type: String, default: "" }, 

    pickupOtp: { type: String, default: "" },
    pickupOtpVerified: { type: Boolean, default: false },
    rejectedByDrivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Driver" }],

    acceptedAt: { type: Date, default: null },
    arrivedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    distanceKm: { type: Number, default: 0 },
    durationMin: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      default: null,
    },
    paymentRef: { type: String, default: "" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

RideSchema.index({ pickupLocation: "2dsphere" });
RideSchema.index({ driverId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Ride", RideSchema);
