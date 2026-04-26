import { findUserByClerkId } from "../users/user.service.js";
import {
  getDriverStats,
  getPermitStatusSummary,
  getDriverBids,
  getDriverTrips,
  getDriverActiveShipments,
} from "./driver.service.js";

export const getDriverDashboard = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers allowed" });
    }

    const stats = await getDriverStats(user.id);
    const permits = await getPermitStatusSummary(user.id);

    res.json({
      ...stats,
      permits,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
export const getDriverBidsHandler = async (req, res) => {
  try {
    console.log("1. auth userId:", req.auth.userId); // ← add

    const user = await findUserByClerkId(req.auth.userId);
    console.log("2. found user:", user?.id, user?.role); // ← add

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers allowed" });
    }

    const bids = await getDriverBids(user.id);
    console.log("3. bids count:", bids?.length); // ← add

    res.json(bids);
  } catch (err) {
    console.error("getDriverBidsHandler ERROR:", err); // ← add
    res.status(500).json({ message: "Failed to fetch driver bids" });
  }
};
export const getDriverTripsHandler = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers allowed" });
    }

    const trips = await getDriverTrips(user.id);
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch driver trips" });
  }
};

export const getActiveShipmentsHandler = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers allowed" });
    }

    const shipments = await getDriverActiveShipments(user.id);
    res.json(shipments);
  } catch (err) {
    console.error("getActiveShipmentsHandler error:", err.message);
    res.status(500).json({ message: "Failed to fetch active shipments" });
  }
};