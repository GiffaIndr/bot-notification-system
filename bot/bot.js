const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

const app = express();
app.use(express.json());

let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { qr, connection } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log(" WhatsApp Bot Connected");
    }
  });
}

startBot();

app.post("/send-wa", async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message)
      return res.status(400).json({ error: "Number & message required" });

    await sock.sendMessage(number + "@s.whatsapp.net", {
      text: message,
    });

    res.json({ message: "Message sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send" });
  }
});

app.listen(4000, () => {
  console.log(" WA Bot running on port 4000");
});
