import { supabase } from "../../config/supabaseClient.js";

// Create notification
export const createNotification = async (user_id, message) => {
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id,
      message
    });

  if (error) throw error;
};

// Get user notifications
export const getUserNotifications = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) throw error;
};