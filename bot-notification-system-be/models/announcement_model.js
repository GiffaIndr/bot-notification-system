const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  environmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Environment",
    required: true,
  },

  title: String,
  message: String,
  
  scheduledAt: {
    type: Date,
  },

  isPublished: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);
