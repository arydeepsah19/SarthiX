import {
  placeOrUpdateBid,
  getBidsForShipment,
  acceptBid,
} from "./bids.service.js";
import { createNotification } from "../notifications/notifications.service.js";
import { supabase } from "../../config/supabaseClient.js";
import { findUserByClerkId } from "../users/user.service.js";

export const createOrUpdateBid = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can bid" });
    }

    const { shipment_id, bid_price, eta_hours } = req.body;

    const { data: shipment, error } = await supabase
      .from("shipments")
      .select("min_bid_price, status, bidding_deadline")
      .eq("id", shipment_id)
      .single();

    if (error || !shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    if (shipment.status !== "open") {
      return res.status(400).json({ message: "Bidding closed" });
    }

    if (
      shipment.bidding_deadline &&
      new Date() > new Date(shipment.bidding_deadline)
    ) {
      return res.status(400).json({ message: "Bidding deadline has passed" });
    }

    if (bid_price < shipment.min_bid_price) {
      return res.status(400).json({
        message: `Bid must be ≥ ${shipment.min_bid_price}`,
      });
    }

    const bid = await placeOrUpdateBid({
      shipment_id,
      driver_id: user.id,
      bid_price,
      eta_hours,
    });

    const { data: shipmentDetails } = await supabase
      .from("shipments")
      .select("company_id")
      .eq("id", shipment_id)
      .single();

    if (shipmentDetails) {
      await createNotification(
        shipmentDetails.company_id,
        `New bid placed on your shipment`,
      );
    }

    res.status(201).json(bid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place bid" });
  }
};

export const listBids = async (req, res) => {
  try {
    const bids = await getBidsForShipment(req.params.shipmentId);
    res.json(bids);
  } catch (err) {
    console.error("LIST BIDS ERROR:", err); 
    res.status(500).json({ message: "Failed to fetch bids" });
  }
};

export const acceptBidByCompany = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { bidId, shipmentId } = req.body;

    if (user.role !== "company") {
      return res
        .status(403)
        .json({ message: "Only companies can accept bids" });
    }

    if (!bidId || !shipmentId) {
      return res
        .status(400)
        .json({ message: "bidId and shipmentId are required" });
    }

    const { data: shipment, error } = await supabase
      .from("shipments")
      .select("company_id")
      .eq("id", shipmentId)
      .single();

    if (error || !shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    if (shipment.company_id !== user.id) {
      return res.status(403).json({ message: "You do not own this shipment" });
    }

    await acceptBid(bidId, shipmentId);

    res.status(200).json({ message: "Bid accepted successfully" });
  } catch (err) {
    console.error("ACCEPT BID ERROR:", err.message);
    res.status(400).json({ message: err.message || "Failed to accept bid" });
  }
};

// ── PATCH /bids/:bidId — driver edits their own pending bid ──────────────────
export const updateBid = async (req, res) => {
  try {
    // ✅ Fix: was req.user.id (undefined) — must use Clerk auth like every other handler
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Drivers only" });
    }

    const { bidId } = req.params;
    const { bid_price, eta_hours } = req.body;

    if (!bid_price) {
      return res.status(400).json({ message: "bid_price is required" });
    }

    const { data, error } = await supabase
      .from("bids")
      .update({
        bid_price,
        eta_hours,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bidId)
      .eq("driver_id", user.id) // ✅ now uses resolved user.id
      .eq("status", "pending")
      .select()
      .single();

    if (error) throw error;

    // data is null when no row matched (wrong driver or non-pending bid)
    if (!data) {
      return res.status(403).json({
        message: "Bid not found, already accepted, or not yours",
      });
    }

    res.json(data);
  } catch (err) {
    console.error("updateBid error:", err.message);
    res.status(500).json({ message: "Failed to update bid" });
  }
};

// ── GET /bids/my?shipment_id=<uuid> — driver fetches their own bid ────────────
export const getMyBid = async (req, res) => {
  try {
    // ✅ Fix: was req.user.id (undefined) — must use Clerk auth like every other handler
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Drivers only" });
    }

    const { shipment_id } = req.query;

    if (!shipment_id) {
      return res
        .status(400)
        .json({ message: "shipment_id query param required" });
    }

    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("shipment_id", shipment_id)
      .eq("driver_id", user.id) // ✅ now uses resolved user.id
      .maybeSingle();

    if (error) throw error;

    // null means no bid yet — frontend handles this gracefully
    res.json(data);
  } catch (err) {
    console.error("getMyBid error:", err.message);
    res.status(500).json({ message: "Failed to fetch bid" });
  }
};
