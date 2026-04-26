import {
  createShipment,
  getAllOpenShipments,
  updateShipmentStatus,
  getShipmentById,
  getCompanyShipments,
  upsertShipmentLocation,
  getShipmentLocation,
} from "./shipments.service.js";
import { findUserByClerkId } from "../users/user.service.js";
import { supabase } from "../../config/supabaseClient.js";

export const postShipment = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const user = await findUserByClerkId(clerkUserId);

    if (user.role !== "company") {
      return res
        .status(403)
        .json({ message: "Only companies can post shipments" });
    }

    const shipment = await createShipment({
      company_id: user.id,
      ...req.body,
    });

    res.status(201).json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create shipment" });
  }
};

export const listShipments = async (req, res) => {
  try {
    const shipments = await getAllOpenShipments();
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shipments" });
  }
};

export const changeShipmentStatus = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { id } = req.params;
    const { status } = req.body;

    const { data: shipment } = await supabase
      .from("shipments")
      .select("*")
      .eq("id", id)
      .single();

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Driver rules
    if (user.role === "driver") {
      if (shipment.assigned_driver_id !== user.id) {
        return res
          .status(403)
          .json({ message: "You are not assigned to this shipment" });
      }

      if (shipment.status === "assigned" && status === "in_transit") {
        return res.json(await updateShipmentStatus(id, status));
      }

      if (shipment.status === "in_transit" && status === "delivered") {
        const { data: acceptedBid } = await supabase
          .from("bids")
          .select("bid_price")
          .eq("shipment_id", id)
          .eq("status", "accepted")
          .single();

        // create trip record
        await supabase.from("trips").insert({
          shipment_id: id,
          driver_id: user.id,
          earning_amount: acceptedBid.bid_price,
        });

        return res.json(await updateShipmentStatus(id, status));
      }

      return res.status(403).json({ message: "Invalid status transition" });
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

export const getShipmentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await getShipmentById(id);

    res.json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch shipment details" });
  }
};
export const getCompanyShipmentsHandler = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "company") {
      return res.status(403).json({ message: "Only companies allowed" });
    }

    const shipments = await getCompanyShipments(user.id);
    res.json(shipments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch company shipments" });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    if (user.role !== "driver") {
      return res
        .status(403)
        .json({ message: "Only drivers can update location" });
    }

    const { id } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const location = await upsertShipmentLocation(id, lat, lng);
    res.json(location);
  } catch (err) {
    console.error("updateLocation error:", err.message);
    res.status(500).json({ message: "Failed to update location" });
  }
};

export const fetchLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await getShipmentLocation(id);
    res.json(location);
  } catch (err) {
    console.error("fetchLocation error:", err.message);
    res.status(500).json({ message: "Failed to fetch location" });
  }
};
export const notifyDriver = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { id } = req.params;
    const { message } = req.body;

    // Get shipment to find the assigned driver
    const { data: shipment } = await supabase
      .from("shipments")
      .select("assigned_driver_id, pickup_location, drop_location")
      .eq("id", id)
      .single();

    if (!shipment?.assigned_driver_id) {
      return res
        .status(400)
        .json({ message: "No driver assigned to this shipment" });
    }

    // Create a notification for the driver
    await supabase.from("notifications").insert({
      user_id: shipment.assigned_driver_id,
      message:
        message ??
        `Material loaded for shipment ${shipment.pickup_location} → ${shipment.drop_location}. Please start your journey.`,
    });

    res.json({ message: "Driver notified" });
  } catch (err) {
    console.error("notifyDriver error:", err.message);
    res.status(500).json({ message: "Failed to notify driver" });
  }
};