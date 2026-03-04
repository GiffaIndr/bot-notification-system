import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const environmentSchema = new Schema({
  name: String,
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  inviteCode: { type: String, unique: true },
  status: {
    type: String,
    enum: ["connected", "disconnected", "connecting"],
    default: "disconnected",
  },
  featureFlags: {
    autoReply: { type: Boolean, default: false },
    autoWelcome: { type: Boolean, default: false },
    broadcastEnabled: { type: Boolean, default: true },
  },

  delayMs: {
    type: Number,
    default: 2000,
  },
  createdAt: { type: Date, default: Date.now },
});

export default models.Environment || model("Environment", environmentSchema);
