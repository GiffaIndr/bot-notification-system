import { findOne } from "../models/user_model.js";

async function handleCommand(environmentId, sender, text, sock) {
  const prefix = "!";
  if (!text.startsWith(prefix)) return;
  const command = text.slice(1).toLowerCase();
  const phone = sender.split("@")[0];
  const user = await findOne({
    phone,
    environmentId,
  });

  if (!user) {
    return sock.sendMessage(sender, {
      text: "Kamu belum terdaftar di sistem.",
    });
  }

  if (command === "help") {
    return sock.sendMessage(sender, {
      text: `
Command tersedia:
!help
!status
!subscribe
      `,
    });
  }

  if (command === "status") {
    return sock.sendMessage(sender, {
      text: `Role kamu: ${user.role}`,
    });
  }

  if (command === "subscribe") {
    return sock.sendMessage(sender, {
      text: "Untuk perpanjang subscription hubungi admin.",
    });
  }
}

export default { handleCommand };
