const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user_model");
const Environment = require("../models/environment_model");
const auth = require("../middleware/auth");


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

    if (!inviteCode)
      return res.status(400).json({ error: "Invite code required" });

    const environment = await Environment.findById(inviteCode);
    if (!environment)
      return res.status(400).json({ error: "Invalid invite code" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "M",
      environmentId: inviteCode,
    });

    res.json({ message: "Member registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Registration failed" });
  }
});


router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password, envId } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const hashedPassword = await bcrypt.hash(password, 10);

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
    if (!user)
      return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;