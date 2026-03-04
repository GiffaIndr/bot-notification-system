import { getBot } from "../wa/waManager.js";
import WALog from "../models/wa_log_model.js";

export async function sendWhatsAppMessage(
  environmentId,
  phoneNumber,
  message
) {
  const sock = getBot(environmentId);

  if (!sock) {
    await WALog.create({
      environmentId,
      phoneNumber,
      message,
      status: "failed",
      error: "Bot not connected",
    });

    return { success: false, error: "Bot not connected" };
  }

  try {
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