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
      enum: ["booked", "completed", "canceled","scheduled"],
      default: "booked",
    },
    canceledBy: {
      type: String,
      enum: ["user", "driver", null],
      default: null,
    },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver",default: null },
    fare: { type: Number,default: 0 },   
    scheduledTime: { type: Date , default: null }, 
    cancelReason: { type: String, default: "" }, 

  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", RideSchema);