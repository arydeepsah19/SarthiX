import express from "express";
import { requireAuth } from "../../config/clerk.js";
import {fetchNotifications, markNotificationRead} from "./notifications.controller.js";

const router = express.Router();

// Get all notifications for logged-in user
router.get("/", requireAuth, fetchNotifications);

// Mark notification as read
router.patch("/:id/read", requireAuth, markNotificationRead);

export default router;