import { Router } from "express";
const router = Router();
import { initBot } from "../wa/waManager.js";
import auth from "../middleware/auth.js";
import { sendWhatsAppMessage } from "../services/waService.js";
import Environment from "../models/environment_model.js";

router.post("/connect", auth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const environment = await Environment.findOne({
      ownerId: req.userId,
    });

    if (!environment) {
      return res.status(404).json({ message: "Environment not found" });
    }

    const io = req.app.get("io");

    await initBot(environment._id, io);

    res.json({ message: "Bot connecting..." });
  } catch (err) {
    console.error("CONNECT ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/test-send", async (req, res) => {
  const { environmentId, phone, message } = req.body;

  await sendWA(environmentId, phone, message);

  res.json({ message: "Message sent" });
});

router.post("/send", async (req, res) => {
  const { environmentId, phoneNumber, message } = req.body;

  const result = await sendWhatsAppMessage(environmentId, phoneNumber, message);

  res.json(result);
});

export default router;
