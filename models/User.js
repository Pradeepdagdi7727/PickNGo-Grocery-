const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "customer"],
    default: "customer"
  },

  // 🔐 OTP / Reset system
  reset_token: {
    type: String,
    default: null
  },

  reset_expires: {
    type: Date,
    default: null
  },

  // 🧾 Profile fields
  gender: String,
  dob: Date,
  address: String

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);