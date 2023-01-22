const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  emailId: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  emailChangeOtp: { type: String, default: null },
  otp: { type: String, default: null },
  tempEmail: { type: String, default: null },
  interests: { type: Array, default: [] },
  userType: { type: String, default: "USER", enum: ["USER", "ADMIN"] },
  accountVerified: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
},{ timestamps: true });

module.exports = mongoose.model("User", userSchema);
