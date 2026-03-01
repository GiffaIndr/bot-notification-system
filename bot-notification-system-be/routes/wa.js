import { Router } from "express"
const router = Router()
import { initBot } from "../wa/waManager.js"
import auth from "../middleware/auth.js"
import { sendWA } from "../services/waService.js"

router.post("/connect", auth, async (req, res) => {
  const environmentId = req.user.environmentId

  await initBot(environmentId)

  res.json({ message: "Bot initializing. Scan QR di terminal." })
})

router.post("/test-send", async (req, res) => {
  const { environmentId, phone, message } = req.body

  await sendWA(environmentId, phone, message)

  res.json({ message: "Message sent" })
})

export default router