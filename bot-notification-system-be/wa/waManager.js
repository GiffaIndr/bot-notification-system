import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";

import pino from "pino";
import path from "path";
import qrcode from "qrcode-terminal";
// import commandHandler from "../commandHandler.js";

// simpan bot per environment
const bots = {};

// Top-level await di ESM
const { version } = await fetchLatestBaileysVersion();

export async function initBot(environmentId) {
  const sock = makeWASocket({
    printQRInTerminal: true,
  });

  // simpan bot
  bots[environmentId] = sock;

  sock.ev.on("connection.update", (update) =>
    console.log("Connection update:", update)
  );
  sock.ev.on("messages.upsert", (msg) => commandHandler(sock, msg));

  console.log("Bot WhatsApp siap!");
  return sock;
}

// ===== EKSPOR getBot =====
export function getBot(environmentId) {
  return bots[environmentId];
}