const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RiderSchema = new Schema(
  {
    fullname: { type: String, default: "" },
    mobile: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    age: { type: Number, default: 0 },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Rider", RiderSchema);
