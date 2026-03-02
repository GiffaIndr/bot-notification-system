import { getBot } from "../wa/waManager.js";
import WALog from "../models/wa_log_model.js";

export async function sendWhatsAppMessage(
  environmentId,
  phoneNumber,
  message
) {
  try {
    const sock = getBot(environmentId);

    if (!sock) {
      throw new Error("Bot not initialized for this environment");
    }

    const jid = phoneNumber.includes("@s.whatsapp.net")
      ? phoneNumber
      : `${phoneNumber}@s.whatsapp.net`;

    await sock.sendMessage(jid, { text: message });

    await WALog.create({
      environmentId,
      phoneNumber,
      message,
      status: "success",
    });

    return { success: true };
  } catch (err) {
    console.error("WA SEND ERROR:", err);

    await WALog.create({
      environmentId,
      phoneNumber,
      message,
      status: "failed",
      error: err.message,
    });

    return { success: false, error: err.message };
  }
}