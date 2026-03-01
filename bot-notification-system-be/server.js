import 'dotenv/config';

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import cron from "node-cron"

// ===== MODELS =====
import Announcement from "./models/announcement_model.js"
import Notification from "./models/notification_model.js"
import User from "./models/user_model.js"
import Environment from "./models/environment_model.js"

// ===== ROUTES =====
import authRoutes from "./routes/auth.js"
import announcementRoutes from "./routes/announcement.js"
import notificationRoutes from "./routes/notification.js"
import environmentRoutes from "./routes/environment.js"
import paymentRoutes from "./routes/payment.js"
import waRoutes from "./routes/wa.js"

// ===== INIT APP =====
const app = express()

// WA Bot Manager
import { initBot } from "./wa/waManager.js"

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES REGISTER =====
app.use("/auth", authRoutes);
app.use("/notification", notificationRoutes);
app.use("/announcement", announcementRoutes);
app.use("/payment", paymentRoutes);
app.use("/environment", environmentRoutes);
app.use("/api/wa", waRoutes);

// ===== HTTP + SOCKET SERVER =====
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

app.set("io", io);

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

// ===== CRON JOB - Scheduled Announcement =====
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const scheduledAnnouncements = await Announcement.find({
      isPublished: false,
      scheduledAt: { $lte: now },
    });

    if (scheduledAnnouncements.length === 0) return;

    for (const announcement of scheduledAnnouncements) {
      announcement.isPublished = true;
      await announcement.save();

      const users = await User.find({
        environmentId: announcement.environmentId,
      });

      if (users.length === 0) continue;

      const notifications = users.map((u) => ({
        userId: u._id,
        announcementId: announcement._id,
      }));

      await Notification.insertMany(notifications);

      users.forEach((u) => {
        io.to(u._id.toString()).emit("newNotification");
      });

      console.log(`Scheduled announcement published: ${announcement.title}`);
    }
  } catch (err) {
    console.error("Cron error:", err);
  }
});

async function autoBootBots() {
  try {
    const environments = await Environment.find()

    console.log("Environment found:", environments.length)

    for (let env of environments) {
      console.log("ENV ID:", env._id)
      await initBot(env._id.toString())
    }

    console.log("All bots initialized")
  } catch (err) {
    console.error("AUTOBOOT ERROR:", err)
  }
}

// ===== DATABASE CONNECT =====
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected");
  autoBootBots();
  
    // START SERVER only after DB connected
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
