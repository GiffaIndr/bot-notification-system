import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["A1", "A2", "M"], default: "M" },
  environmentId: {
    type: Schema.Types.ObjectId,
    ref: "Environment",
    default: null,
  },
  phone: String,
  isPaid: { type: Boolean, default: false },
  semesterExpired: Date,
});

export default models.User || model("User", userSchema);
