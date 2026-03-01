import { Router } from "express";
import Notification from "../models/notification_model.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET unread notification count
router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all notifications
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.userId,
    })
      .populate("announcementId")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// MARK single notification as read
router.patch("/:id", auth, async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, userId: req.userId },
      { $set: { isRead: true } }
    );

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// MARK ALL AS READ
router.patch("/mark-all-read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;