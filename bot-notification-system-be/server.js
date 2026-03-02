import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";

// ===== MODELS =====
import Announcement from "./models/announcement_model.js";
import Notification from "./models/notification_model.js";
import User from "./models/user_model.js";
import Environment from "./models/environment_model.js";

// ===== ROUTES =====
import authRoutes from "./routes/auth.js";
import announcementRoutes from "./routes/announcement.js";
import notificationRoutes from "./routes/notification.js";
import environmentRoutes from "./routes/environment.js";
import paymentRoutes from "./routes/payment.js";
import waRoutes from "./routes/wa.js";

// ===== WA MANAGER =====
import { initBot } from "./wa/waManager.js";
import { sendWhatsAppMessage } from "./services/waService.js";

// ===== INIT APP =====
const app = express();
const server = http.createServer(app);

// ===== SOCKET =====
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

app.set("io", io);

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES =====
app.use("/auth", authRoutes);
app.use("/notification", notificationRoutes);
app.use("/announcement", announcementRoutes);
app.use("/payment", paymentRoutes);
app.use("/environment", environmentRoutes);
app.use("/api/wa", waRoutes);

// ===== SOCKET LOGIC =====
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinEnvironment", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ===== CRON JOB =====
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const scheduledAnnouncements = await Announcement.find({
      isPublished: false,
      scheduledAt: { $lte: now },
    });

    if (!scheduledAnnouncements.length) return;

    for (const announcement of scheduledAnnouncements) {
      announcement.isPublished = true;
      await announcement.save();

      const users = await User.find({
        environmentId: announcement.environmentId,
      });

      if (!users.length) continue;

      const notifications = users.map((u) => ({
        userId: u._id,
        announcementId: announcement._id,
      }));

      await Notification.insertMany(notifications);
      const message =
        announcement.waTemplate ||
        `📢 ${announcement.title}\n\n${announcement.content}`;

      for (const u of users) {
        io.to(u._id.toString()).emit("newNotification");

        if (u.phoneNumber) {
          await sendWhatsAppMessage(
            announcement.environmentId.toString(),
            u.phoneNumber,
            message,
          );
        }
      }

      console.log(`Scheduled announcement published: ${announcement.title}`);
    }
  } catch (err) {
    console.error("Cron error:", err);
  }
});

// ===== AUTO BOOT BOTS =====
async function autoBootBots() {
  try {
    const environments = await Environment.find();

    console.log("Environment found:", environments.length);

    for (const env of environments) {
      console.log("INIT BOT ENV:", env._id.toString());
      await initBot(env._id.toString(), io);
    }

    console.log("All bots initialized");
  } catch (err) {
    console.error("AUTOBOOT ERROR:", err);
  }
}

// ===== START SERVER =====
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await autoBootBots();

    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error("START SERVER ERROR:", err);
  }
}

startServer();
