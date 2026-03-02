import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from "@whiskeysockets/baileys";

import pino from "pino";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import qrcode from "qrcode-terminal";
import Environment from "../models/environment_model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bots = {};

export async function initBot(environmentId, io) {
  try {
    console.log("INIT BOT CALLED:", environmentId);

    const sessionPath = path.join(
      __dirname,
      "sessions",
      environmentId.toString(),
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
      browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, qr, lastDisconnect } = update;

      // 🔥 CONNECTING
      if (connection === "connecting") {
        await Environment.findByIdAndUpdate(environmentId, {
          status: "connecting",
        });

        console.log("Bot connecting:", environmentId);
      }

      // QR GENERATED
      if (qr) {
        console.log(`Scan QR untuk ENV: ${environmentId}`);
        qrcode.generate(qr, { small: true });
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

        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect) {
          console.log("Reconnecting...");
          initBot(environmentId);
        }
      }
    });

    bots[environmentId] = sock;

    console.log("Bot initialized:", environmentId);
  } catch (err) {
    console.error("AUTOBOOT ERROR:", err);
  }
}

export function getBot(environmentId) {
  return bots[environmentId];
}
