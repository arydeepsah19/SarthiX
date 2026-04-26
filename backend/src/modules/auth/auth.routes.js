import express from "express";
import { requireAuth } from "../../config/clerk.js";

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "Authenticated user",
    userId: req.auth.userId,
    sessionId: req.auth.sessionId
  });
});

export default router;
