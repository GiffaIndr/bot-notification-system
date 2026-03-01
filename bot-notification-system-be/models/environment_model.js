import mongoose from "mongoose"

const { Schema, model, models } = mongoose

const environmentSchema = new Schema({
  name: String,
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  inviteCode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
})

export default models.Environment || model("Environment", environmentSchema)