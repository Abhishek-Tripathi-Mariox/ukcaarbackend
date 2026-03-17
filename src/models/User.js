const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullname: { type: String, default: "" },
    mobile: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },
    ridepreference: {
      type: String,
      enum: ["Comfort", "Economy", "Premium"],
      default: "Comfort",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    email: { type: String, default: "" },
    currentAddress: { type: Schema.Types.ObjectId, ref: "Address", default: null },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    referralCode: { type: String, default: "" },
    referrerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    pushNotification: { type: Boolean, default: true },
    promotionalNotification: { type: Boolean, default: true },

  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
