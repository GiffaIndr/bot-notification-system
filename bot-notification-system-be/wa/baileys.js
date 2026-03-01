import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys"

import pino from "pino"
import path from "path"
import qrcode from "qrcode-terminal"
import commandHandler from "./commandHandler.js"
const { version } = await fetchLatestBaileysVersion()

async function startBot(environmentId) {
  const sessionPath = path.join(__dirname, "sessions", environmentId);

  console.log("Starting WA socket for:", environmentId);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    version,
    logger: pino({ level: "info" }),
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    console.log("CONNECTION UPDATE:", update);

    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log(`Scan QR untuk environment: ${environmentId}`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      console.log("Connection closed:", lastDisconnect?.error);
    }

    if (connection === "open") {
      console.log(`Bot connected: ${environmentId}`);
    }
  });

  return sock;
}
module.exports = { startBot };
