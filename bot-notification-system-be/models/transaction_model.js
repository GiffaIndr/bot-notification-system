const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: String,
  orderId: String,
  amount: Number,
  status: String,
});

module.exports = mongoose.model("Transaction", TransactionSchema);
