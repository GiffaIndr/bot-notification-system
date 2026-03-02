import mongoose from "mongoose";

const waLogSchema = new mongoose.Schema({
  environmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Environment",
  },
  phoneNumber: String,
  message: String,
  status: {
    type: String,
    enum: ["success", "failed"],
  },
  error: String,
}, { timestamps: true });

export default mongoose.model("WALog", waLogSchema);