import { addPermit, getDriverPermits } from "./permits.service.js";
import { findUserByClerkId } from "../users/user.service.js";

export const createPermit = async (req, res) => {
  try {
    console.log("AUTH:", req.auth);

    if (!req.auth?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await findUserByClerkId(req.auth.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can add permits" });
    }

    const { permit_number, permit_type, valid_from, expiry_date } = req.body;

    if (!permit_number || !permit_type || !valid_from) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const permit = await addPermit({
      driver_id: user.id,
      permit_number,
      permit_type,
      valid_from,
      expiry_date,
    });

    res.status(201).json(permit);
  } catch (err) {
    console.error("CREATE PERMIT ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to add permit" });
  }
};

export const listPermits = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can view permits" });
    }

    const permits = await getDriverPermits(user.id);
    res.json(permits);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch permits" });
  }
};
