import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from "@whiskeysockets/baileys";

import pino from "pino";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Environment from "../models/environment_model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production-safe bot storage
const bots = new Map();

export async function initBot(environmentId, io) {
  try {
    console.log("INIT BOT CALLED:", environmentId);

    // Prevent duplicate bot instance
    if (bots.has(environmentId)) {
      console.log("Bot already initialized:", environmentId);
      return;
    }

    const sessionPath = path.join(
      __dirname,
      "sessions",
      environmentId.toString()
    );

    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      auth: state,
      browser: ["Bot Notification", "Chrome", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, qr, lastDisconnect } = update;

      // CONNECTING
      if (connection === "connecting") {
        await Environment.findByIdAndUpdate(environmentId, {
          status: "connecting",
        });

        io?.emit("botStatusUpdate", {
          environmentId,
          status: "connecting",
        });

        console.log("Bot connecting:", environmentId);
      }

      // 📷 QR GENERATED → SEND TO DASHBOARD
      if (qr) {
        console.log("QR generated for:", environmentId);

        io?.emit("qrUpdate", {
          environmentId,
          qr,
        });
      }

      // CONNECTED
      if (connection === "open") {
        await Environment.findByIdAndUpdate(environmentId, {
          status: "connected",
        });

        io?.emit("botStatusUpdate", {
          environmentId,
          status: "connected",
        });

        console.log("Bot connected:", environmentId);
      }

      // DISCONNECTED
      if (connection === "close") {
        await Environment.findByIdAndUpdate(environmentId, {
          status: "disconnected",
        });

        io?.emit("botStatusUpdate", {
          environmentId,
          status: "disconnected",
        });

        console.log("Bot disconnected:", environmentId);

        bots.delete(environmentId);

        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect) {
          console.log("Reconnecting bot:", environmentId);
          setTimeout(() => {
            initBot(environmentId, io);
          }, 3000);
        }
      }
    });

    // 🔥 Save bot instance
    bots.set(environmentId, sock);

    console.log("Bot initialized:", environmentId);
  } catch (err) {
    console.error("BOT INIT ERROR:", err);
  }
}

export function getBot(environmentId) {
  return bots.get(environmentId);
}

export function removeBot(environmentId) {
  bots.delete(environmentId);
}