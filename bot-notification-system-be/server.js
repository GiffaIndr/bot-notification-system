require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");

// ===== MODELS =====
const Announcement = require("./models/announcement_model");
const Notification = require("./models/notification_model");
const User = require("./models/user_model");

// ===== ROUTES =====
const authRoutes = require("./routes/auth");
const announcementRoutes = require("./routes/announcement");
const notificationRoutes = require("./routes/notification");
const environmentRoutes = require("./routes/environment");
const paymentRoutes = require("./routes/payment");

// ===== INIT APP =====
const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES REGISTER =====
app.use("/auth", authRoutes);
app.use("/notification", notificationRoutes);
app.use("/announcement", announcementRoutes);
app.use("/payment", paymentRoutes);
app.use("/environment", environmentRoutes);

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

      console.log(
        `Scheduled announcement published: ${announcement.title}`
      );
    }
  } catch (err) {
    console.error("Cron error:", err);
  }
});

// ===== DATABASE CONNECT =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // START SERVER only after DB connected
    server.listen(process.env.PORT || 3000, () => {
      console.log(
        `Server running on port ${process.env.PORT || 3000}`
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });