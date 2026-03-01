import { getBot } from "../wa/waManager.js";

async function sendWA(environmentId, phone, message) {
  const sock = getBot(environmentId);
  if (!sock) throw new Error("Bot belum connect");
  const formatted = phone + "@s.whatsapp.net";
  await sock.sendMessage(formatted, { text: message });
}
export { sendWA };
