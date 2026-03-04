import { Router } from "express";
import auth from "../middleware/auth.js";
import Environment from "../models/environment_model.js";
import User from "../models/user_model.js";
import bcrypt from "bcrypt";

const router = Router();

const generateCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

router.get("/me", auth, async (req, res) => {
  try {
    const environment = await Environment.findOne({
      ownerId: req.userId,  
    });

    if (!environment) {
      return res.status(404).json({ message: "Environment not found" });
    }

    res.json(environment);
  } catch (err) {
    console.error("ENV ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/create", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isPaid) {
      return res.status(403).json({ error: "Must subscribe first" });
    }

    // 🔥 FIX PENTING
    if (!user.environments) {
      user.environments = [];
    }

    const inviteCode = generateCode();

    const env = await Environment.create({
      name: req.body.name,
      ownerId: user._id,
      inviteCode,
    });

    user.environments.push({
      environmentId: env._id,
      role: "A1",
    });

    user.environmentId = env._id;

    await user.save();

    res.json(env);
  } catch (err) {
    console.error("CREATE ENV ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/invite-admin", auth, async (req, res) => {
  try {
    if (req.role !== "A1")
      return res.status(403).json({ error: "Only A1 can invite admin" });

    const inviteLink = `http://localhost:5173/join-admin?env=${req.environmentId}`;

    res.json({ inviteLink });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/invite-member", auth, async (req, res) => {
  try {
    if (!["A1", "A2"].includes(req.role))
      return res.status(403).json({ error: "Not allowed" });

    const inviteLink = `http://localhost:5173/join-member?env=${req.environmentId}`;

    res.json({ inviteLink });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/join", auth, async (req, res) => {
  try {
    const { environmentId, role } = req.body;

    const user = await User.findById(req.userId);

    // Cek apakah sudah join
    const alreadyJoined = user.environments.find(
      (e) => e.environmentId.toString() === environmentId,
    );

    if (alreadyJoined) return res.status(400).json({ error: "Already joined" });

    user.environments.push({
      environmentId,
      role: role || "M",
    });

    user.activeEnvironment = environmentId;

    await user.save();

    res.json({ message: "Joined successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/switch", auth, async (req, res) => {
  try {
    const { environmentId } = req.body;

    const user = await User.findById(req.userId);

    const exists = user.environments.find(
      (e) => e.environmentId.toString() === environmentId,
    );

    if (!exists) return res.status(403).json({ error: "Not your environment" });

    user.activeEnvironment = environmentId;
    await user.save();

    res.json({ message: "Switched environment" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
