import { findUserByClerkId } from "../users/user.service.js";
import {getUserNotifications, markAsRead } from "./notifications.service.js";

export const fetchNotifications = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    const notifications = await getUserNotifications(user.id);

    res.json(notifications);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { id } = req.params;

    await markAsRead(id, user.id);

    res.json({ message: "Notification marked as read" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update notification" });
  }
};