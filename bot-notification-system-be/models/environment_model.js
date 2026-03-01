const mongoose = require("mongoose");

const environmentSchema = new mongoose.Schema({
  name: String,

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  inviteCode: {
    type: String,
    unique: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.Environment ||
  mongoose.model("Environment", environmentSchema);
