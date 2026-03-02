import { Router } from "express";
const router = Router();
import { initBot } from "../wa/waManager.js";
import auth from "../middleware/auth.js";
import { sendWhatsAppMessage } from "../services/waService.js";

router.post("/connect", auth, async (req, res) => {
  const environmentId = req.user.environmentId;

  await initBot(environmentId);

  res.json({ message: "Bot initializing. Scan QR di terminal." });
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
