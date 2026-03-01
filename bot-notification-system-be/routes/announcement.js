import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

import Announcement from "../models/announcement_model.js";
import User from "../models/user_model.js";

const router = Router();

/* ============================
   CREATE ANNOUNCEMENT
============================ */
router.post("/create", auth, role(["A1", "A2"]), async (req, res) => {
  try {
    const { title, content, scheduledAt } = req.body;

    const user = await User.findById(req.userId);
    if (!user.environmentId)
      return res.status(400).json({ error: "No environment" });

    const newAnnouncement = await Announcement.create({
      title,
      content,
      environmentId: user.environmentId,
      scheduledAt: scheduledAt || null,
      isPublished: scheduledAt ? false : true,
    });

    // kirim realtime hanya kalau langsung publish
    if (!scheduledAt) {
      const io = req.app.get("io");
      io.to(user.environmentId.toString()).emit(
        "newAnnouncement",
        newAnnouncement
      );
    }

    res.json(newAnnouncement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   DELETE ANNOUNCEMENT
============================ */
router.delete("/:id", auth, role(["A1", "A2"]), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement)
      return res.status(404).json({ error: "Announcement not found" });

    if (!announcement.environmentId.equals(req.environmentId))
      return res.status(403).json({ error: "Not allowed" });

    if (announcement.isPublished)
      return res.status(400).json({
        error: "Cannot delete published announcement",
      });

    await announcement.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   EDIT ANNOUNCEMENT
============================ */
router.put("/:id", auth, role(["A1", "A2"]), async (req, res) => {
  try {
    const { title, content } = req.body;

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement)
      return res.status(404).json({ error: "Announcement not found" });

    if (!announcement.environmentId.equals(req.environmentId))
      return res.status(403).json({ error: "Not allowed" });

    if (announcement.isPublished)
      return res.status(400).json({
        error: "Cannot edit published announcement",
      });

    announcement.title = title;
    announcement.content = content;

    await announcement.save();

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   GET ANNOUNCEMENTS
============================ */
router.get("/", auth, async (req, res) => {
  try {
    const query = {
      environmentId: req.environmentId,
    };

    // Member hanya lihat published
    if (req.role === "M") {
      query.isPublished = true;
    }

    const announcements = await Announcement.find(query).sort({
      createdAt: -1,
    });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;