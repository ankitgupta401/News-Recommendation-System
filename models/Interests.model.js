const mongoose = require("mongoose");

const interestSchema = mongoose.Schema({
  name: { type: String, required: false },
  twitterProfiles: { type: Array, required: false },
  hashTags: { type: Array, required: false },
  isDeleted: { type: Boolean, default: false },
},{ timestamps: true });

module.exports = mongoose.model("Interest", interestSchema);
