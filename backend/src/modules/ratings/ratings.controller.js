import { supabase } from "../../config/supabaseClient.js";
import { findUserByClerkId } from "../users/user.service.js";
import { createRating } from "./ratings.service.js";

export const rateShipment = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { shipment_id, rating, comment } = req.body;

    // 1️⃣ Get shipment
    const { data: shipment } = await supabase
      .from("shipments")
      .select("status, company_id, assigned_driver_id")
      .eq("id", shipment_id)
      .single();

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // 2️⃣ Must be delivered
    if (shipment.status !== "delivered") {
      return res.status(400).json({ message: "Shipment not delivered yet" });
    }

    let driver_id = null;
    let company_id = null;

    // 3️⃣ Company rating driver
    if (user.role === "company") {

      if (shipment.company_id !== user.id) {
        return res.status(403).json({ message: "Not your shipment" });
      }

      driver_id = shipment.assigned_driver_id;
      company_id = user.id;
    }

    // 4️⃣ Driver rating company
    else if (user.role === "driver") {

      if (shipment.assigned_driver_id !== user.id) {
        return res.status(403).json({ message: "Not your shipment" });
      }

      driver_id = user.id;
      company_id = shipment.company_id;
    }

    else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 5️⃣ Prevent duplicate rating
    const { data: existing } = await supabase
      .from("ratings")
      .select("id")
      .eq("shipment_id", shipment_id)
      .eq("driver_id", driver_id)
      .eq("company_id", company_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "Already rated" });
    }

    const newRating = await createRating({
      shipment_id,
      driver_id,
      company_id,
      rating,
      comment
    });

    res.status(201).json(newRating);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit rating" });
  }
};

export const checkRating = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { shipment_id } = req.query;

    if (!shipment_id) {
      return res.status(400).json({ message: "shipment_id required" });
    }

    // Build query based on role — company checks from their side
    let query = supabase
      .from("ratings")
      .select("id")
      .eq("shipment_id", shipment_id)
      .maybeSingle();

    if (user.role === "company") {
      query = supabase
        .from("ratings")
        .select("id")
        .eq("shipment_id", shipment_id)
        .eq("company_id", user.id)
        .maybeSingle();
    } else if (user.role === "driver") {
      query = supabase
        .from("ratings")
        .select("id")
        .eq("shipment_id", shipment_id)
        .eq("driver_id", user.id)
        .maybeSingle();
    }

    const { data } = await query;
    res.json({ rated: !!data });
  } catch (err) {
    console.error("checkRating error:", err.message);
    res.status(500).json({ message: "Failed to check rating" });
  }
};
