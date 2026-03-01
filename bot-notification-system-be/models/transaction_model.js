import { Schema, model } from "mongoose";

const TransactionSchema = new Schema({
  userId: String,
  orderId: String,
  amount: Number,
  status: String,
});

export default model("Transaction", TransactionSchema);
