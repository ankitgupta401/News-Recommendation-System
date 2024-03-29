const mongoose = require("mongoose");

const newsSchema = mongoose.Schema({
  source: { type: String, required: false },
  title: { type: String, required: false },
  hashTags: { type: Array, required: false },
  otherDetails: { type: Object, required: false },
  postId: { type: String, required: false, unique: true },
  views: { type: Number, default: 0 },
  engagements: { type: Number, default: 0 },
  averageViewDuration: { type: Number, default: 0 },
  interestName: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("News", newsSchema);
