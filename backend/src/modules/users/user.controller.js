import { findUserByClerkId, createUser } from "./user.service.js";
import { supabase } from "../../config/supabaseClient.js";

export const syncUser = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { role, name } = req.body;
    let user = await findUserByClerkId(clerkUserId);
    if (!user) {
      user = await createUser({ clerkUserId, name });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "User sync failed" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, role, name, avatar_url, is_verified, verification_status, aadhaar_number, license_number, verification_doc_url, verification_submitted_at",
      )
      .eq("clerk_user_id", clerkUserId)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const setRole = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { role, name } = req.body;
    if (!["driver", "company"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    let existing = await findUserByClerkId(clerkUserId);
    if (!existing) {
      existing = await createUser({ clerkUserId, role: null, name });
    }
    if (existing.role) {
      return res.status(403).json({ message: "Role already set" });
    }
    const { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("clerk_user_id", clerkUserId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to set role" });
  }
};

export const updateUserAvatar = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { avatar_url } = req.body;
    if (!avatar_url) {
      return res.status(400).json({ message: "avatar_url is required" });
    }
    const { data, error } = await supabase
      .from("users")
      .update({ avatar_url })
      .eq("clerk_user_id", clerkUserId)
      .select("id, name, avatar_url, role")
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("updateUserAvatar error:", err.message);
    res.status(500).json({ message: "Failed to update avatar" });
  }
};

export const updatePhoneNumber = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    const { data, error } = await supabase
      .from("users")
      .update({ phone_number })
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("updatePhoneNumber error:", err.message);
    res.status(500).json({ message: "Failed to update phone number" });
  }
};

// ── PATCH /users/submit-verification ─────────────────────────────────────────
// Driver submits Aadhaar, license number, and a document image URL.
// Sets verification_status = 'pending' for admin review in Supabase.
export const submitVerification = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res
        .status(403)
        .json({ message: "Only drivers can submit verification" });
    }

    // Don't allow re-submission if already verified
    if (user.verification_status === "verified") {
      return res.status(400).json({ message: "Already verified" });
    }

    const { aadhaar_number, license_number, verification_doc_url } = req.body;

    if (!aadhaar_number && !license_number) {
      return res
        .status(400)
        .json({ message: "At least one ID (Aadhaar or license) is required" });
    }

    if (!verification_doc_url) {
      return res.status(400).json({ message: "Document image is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        aadhaar_number: aadhaar_number ?? null,
        license_number: license_number ?? null,
        verification_doc_url,
        verification_status: "pending",
        is_verified: false,
        verification_submitted_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select(
        "id, name, verification_status, is_verified, aadhaar_number, license_number",
      )
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("submitVerification error:", err.message);
    res.status(500).json({ message: "Failed to submit verification" });
  }
};

