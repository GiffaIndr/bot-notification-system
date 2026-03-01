import jwt from "jsonwebtoken"
const { verify } = jwt

import User from "../models/user_model.js"

export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: "No token" })

    const token = authHeader.split(" ")[1]
    const decoded = verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ error: "User not found" })

    // EXPIRY CHECK
    if (user.isPaid && user.semesterExpired && new Date(user.semesterExpired) < new Date()) {
      return res.status(403).json({ error: "Subscription expired", expired: true })
    }

    req.userId = user._id
    req.environmentId = user.environmentId
    req.role = user.role

    next()
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: "Invalid token" })
  }
}