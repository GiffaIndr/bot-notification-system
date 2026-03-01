import { Router } from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

import User from "../models/user_model.js";
import Environment from "../models/environment_model.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Auto reset isPaid jika semesterExpired sudah lewat
    if (user.semesterExpired && user.semesterExpired < new Date()) {
      user.isPaid = false;
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/register-member", async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ error: "Invite code required" });

    // Cari environment by inviteCode
    const environment = await Environment.findOne({ inviteCode });
    if (!environment) return res.status(400).json({ error: "Invalid invite code" });

    const hashedPassword = await hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "M",
      environmentId: environment._id,
    });

    res.json({ message: "Member registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Registration failed" });
  }
});

router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password, envId } = req.body;

    const hashedPassword = await hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "A2",
      environmentId: envId,
    });

    res.json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(400).json({ error: "Admin creation failed" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ message: "Register success" });
  } catch (err) {
    res.status(400).json({ error: "Email already used" });
  }
});

// =============================
// LOGIN
// =============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const token = sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;