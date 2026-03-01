import mongoose from "mongoose"

const { Schema, model, models } = mongoose

const notificationSchema = new Schema({
  environmentId: { type: Schema.Types.ObjectId, ref: "Environment", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export default models.Notification || model("Notification", notificationSchema)