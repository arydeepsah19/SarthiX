import { findUserByClerkId } from "../users/user.service.js";
import { getCompanyStats } from "./company.service.js";

export const getCompanyDashboard = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    // 🔒 Role check
    if (user.role !== "company") {
      return res.status(403).json({ message: "Only companies allowed" });
    }

    // 📊 Fetch stats
    const stats = await getCompanyStats(user.id);

    // 📤 Send response
    res.json(stats);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch company dashboard" });
  }
};