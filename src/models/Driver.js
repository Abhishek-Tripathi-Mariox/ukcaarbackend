const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DriverSchema = new Schema(
  {
    fullname: { type: String, default: "" },
    mobile: { type: String, required: true },
    email: { type: String, default: "" },

    ridepreference: {
      type: String,
      enum: ["Instant", "Private", "Schedule"],
      default: "Instant",
    },

    address: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },

    profilePhoto: { type: String, default: "" },

    vehicle: {
      vehicleType: { type: String, default: "" },
      model: { type: String, default: "" },
      color: { type: String, default: "" },
      registrationNumber: { type: String, default: "" },
      manufacturingYear: { type: Number, default: null },
      seatingCapacity: { type: Number, default: null },
    },

    documents: {
      drivingLicense: {
        number: { type: String, default: "" },
        file: { type: String, default: "" },
        expiryDate: { type: Date, default: null },
      },

      rc: {
        file: { type: String, default: "" },
        expiryDate: { type: Date, default: null },
      },

      insurance: {
        number: { type: String, default: "" },
        file: { type: String, default: "" },
        expiryDate: { type: Date, default: null },
      },

      pollutionCertificate: {
        file: { type: String, default: "" },
        expiryDate: { type: Date, default: null },
      },
    },

    bankDetails: {
      accountHolderName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      branchName: { type: String, default: "" },
      passbookfile:{type:String,default:""}
    },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },

    isVerified: { type: Boolean, default: false },

    currentLocation: {
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
    lastLocationUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

DriverSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Driver", DriverSchema);
