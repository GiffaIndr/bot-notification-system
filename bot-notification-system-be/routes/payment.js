import { Router } from "express";
import auth from "../middleware/auth.js";
import Transaction from "../models/transaction_model.js";
import User from "../models/user_model.js";
import pkg from "midtrans-client"; // <-- import default
import dotenv from "dotenv";

dotenv.config(); // <-- ganti require

const { Snap } = pkg; // <-- destructure Snap dari default import

const router = Router();

const snap = new Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// ===========================
// CREATE PAYMENT
// ===========================
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

// ===========================
// CALLBACK
// ===========================
router.post("/callback", async (req, res) => {
  const notif = req.body;

  if (notif.transaction_status === "settlement") {
    const userId = notif.order_id.split("-")[1];

    await User.updateOne(
      { _id: userId },
      {
        isPaid: true,
        semesterExpired: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      }
    );
  }

  res.status(200).send("OK");
});

export default router;