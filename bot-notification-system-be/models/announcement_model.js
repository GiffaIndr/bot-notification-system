import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const announcementSchema = new Schema({
  environmentId: {
    type: Schema.Types.ObjectId,
    ref: "Environment",
    required: true,
  },
  title: String,
  message: String,
  scheduledAt: Date,
  waTemplate: {
    type: String,
  },  
  isPublished: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default models.Announcement || model("Announcement", announcementSchema);
