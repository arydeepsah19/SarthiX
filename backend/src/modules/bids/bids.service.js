import { supabase } from "../../config/supabaseClient.js";
import { createNotification } from "../notifications/notifications.service.js";

export const placeOrUpdateBid = async ({
  shipment_id,
  driver_id,
  bid_price,
  eta_hours,
}) => {
  const { data: existing } = await supabase
    .from("bids")
    .select("id")
    .eq("shipment_id", shipment_id)
    .eq("driver_id", driver_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("bids")
      .update({ bid_price, eta_hours, status: "pending" })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("bids")
    .insert({ shipment_id, driver_id, bid_price, eta_hours })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getBidsForShipment = async (shipmentId) => {
  // ── Step 1: fetch bids with user join ──────────────────────────────────────
  // Use the generic "users" join — Supabase resolves it automatically when
  // there is only one FK from bids → users. If you have multiple FKs,
  // replace "users" with the exact constraint name shown in your Supabase
  // Table Editor under bids → Foreign Keys, e.g. users!bids_driver_id_fkey
  const { data, error } = await supabase
    .from("bids")
    .select(
      `
      id,
      shipment_id,
      driver_id,
      bid_price,
      eta_hours,
      status,
      created_at,
      users (
        id,
        name,
        avatar_url,
        rating,
        trips_completed,
        is_verified,
        verification_status
      )
    `,
    )
    .eq("shipment_id", shipmentId)
    .order("bid_price", { ascending: true });

  // ── Step 2: if the join failed, fetch bids + users separately ─────────────
  if (error) {
    console.error("getBidsForShipment join error:", error.message);
    console.error("Falling back to manual user lookup");

    const { data: bids, error: bidsError } = await supabase
      .from("bids")
      .select(
        "id, shipment_id, driver_id, bid_price, eta_hours, status, created_at",
      )
      .eq("shipment_id", shipmentId)
      .order("bid_price", { ascending: true });

    if (bidsError) throw bidsError;

    // Fetch all driver profiles in one query
    const driverIds = [
      ...new Set(bids.map((b) => b.driver_id).filter(Boolean)),
    ];
    let usersMap = {};

    if (driverIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select(
          "id, name, avatar_url, rating, trips_completed, is_verified, verification_status",
        )
        .in("id", driverIds);

      (users ?? []).forEach((u) => {
        usersMap[u.id] = u;
      });
    }

    return bids.map((b) => ({ ...b, users: usersMap[b.driver_id] ?? null }));
  }

  // ── Step 3: compute live trip counts + ratings from dedicated tables ───────
  const driverIds = [...new Set(data.map((b) => b.driver_id).filter(Boolean))];
  let tripCounts = {};
  let ratingAvgs = {};

  if (driverIds.length > 0) {
    const { data: trips } = await supabase
      .from("trips")
      .select("driver_id")
      .in("driver_id", driverIds);

    (trips ?? []).forEach((t) => {
      tripCounts[t.driver_id] = (tripCounts[t.driver_id] ?? 0) + 1;
    });

    const { data: ratings } = await supabase
      .from("ratings")
      .select("driver_id, rating")
      .in("driver_id", driverIds);

    const groups = {};
    (ratings ?? []).forEach((r) => {
      if (!groups[r.driver_id]) groups[r.driver_id] = [];
      groups[r.driver_id].push(Number(r.rating));
    });
    Object.entries(groups).forEach(([id, vals]) => {
      ratingAvgs[id] = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(
        1,
      );
    });
  }

  return data.map((b) => ({
    ...b,
    users: b.users
      ? {
          ...b.users,
          trips_completed:
            tripCounts[b.driver_id] ?? b.users.trips_completed ?? 0,
          rating: Number(ratingAvgs[b.driver_id] ?? b.users.rating ?? 0),
        }
      : null,
  }));
};

export const acceptBid = async (bidId, shipmentId) => {
  const { data: bid, error: bidError } = await supabase
    .from("bids")
    .select("*")
    .eq("id", bidId)
    .single();

  if (bidError || !bid) throw new Error("Bid not found");

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("status, bidding_deadline")
    .eq("id", shipmentId)
    .single();

  if (shipmentError || !shipment) throw new Error("Shipment not found");
  if (shipment.status !== "open") throw new Error("Shipment already assigned");

  if (
    shipment.bidding_deadline &&
    new Date() > new Date(shipment.bidding_deadline)
  ) {
    throw new Error("Bidding deadline has passed");
  }

  await supabase.from("bids").update({ status: "accepted" }).eq("id", bidId);

  await supabase
    .from("bids")
    .update({ status: "rejected" })
    .eq("shipment_id", shipmentId)
    .neq("id", bidId);

  await supabase
    .from("shipments")
    .update({ status: "assigned", assigned_driver_id: bid.driver_id })
    .eq("id", shipmentId);

  await createNotification(
    bid.driver_id,
    "Your bid has been accepted. Shipment assigned to you.",
  );
};
