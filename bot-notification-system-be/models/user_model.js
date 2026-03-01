const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["A1", "A2", "M"],
    default: "M",
  },

  environmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Environment",
    default: null,
  },

  phone: {
    type: String,
  },

  isPaid: { type: Boolean, default: false },
  semesterExpired: Date,
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
