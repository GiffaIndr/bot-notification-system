const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");
const Transaction = require("../models/transaction_model");
const User = require("../models/user_model");
const auth = require("../middleware/auth");

require("dotenv").config();

const snap = new midtransClient.Snap({
  isProduction: false,

  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// CREATE PAYMENT

router.post("/create", auth, async (req, res) => {
  const userId = req.userId; // otomatis dari token
  const amount = 15000;

  const orderId = "ORDER-" + Date.now();

  const parameter = {
    transaction_details: {
      order_id: `ORDER-${req.userId}-${Date.now()}`,
      gross_amount: amount,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  await Transaction.create({
    userId,
    orderId,
    amount,
    status: "pending",
  });

  res.json({ token: transaction.token });
});

router.post("/callback", async (req, res) => {
  const notif = req.body;

  if (notif.transaction_status === "settlement") {
    const userId = notif.order_id.split("-")[1];


    await User.updateOne(
      { _id: userId },
      {
        isPaid: true,
        semesterExpired: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
    );
  }

  res.status(200).send("OK");
});

module.exports = router;
