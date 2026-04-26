import { supabase } from "../../config/supabaseClient.js";

// ── ORIGINAL FUNCTIONS (do not remove) ───────────────────────────────────────

export const getDriverStats = async (driverId) => {
  // Active bids
  const { count: activeBids } = await supabase
    .from("bids")
    .select("*", { count: "exact", head: true })
    .eq("driver_id", driverId)
    .eq("status", "pending");

  // Trips completed + total earnings
  const { data: trips } = await supabase
    .from("trips")
    .select("earning_amount")
    .eq("driver_id", driverId);

  const tripsCompleted = trips?.length || 0;
  const totalEarnings =
    trips?.reduce((sum, t) => sum + Number(t.earning_amount), 0) || 0;

  // Average rating
  const { data: ratings } = await supabase
    .from("ratings")
    .select("rating")
    .eq("driver_id", driverId);

  const averageRating = ratings?.length
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(
        1,
      )
    : 0;

  // Active shipments (assigned or in_transit)
  const { count: activeShipments } = await supabase
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .eq("assigned_driver_id", driverId)
    .in("status", ["assigned", "in_transit"]);

  return {
    activeBids: activeBids || 0,
    activeShipments: activeShipments || 0,
    tripsCompleted,
    totalEarnings,
    rating: Number(averageRating),
  };
};

export const getPermitStatusSummary = async (driverId) => {
  const { data } = await supabase
    .from("permits")
    .select("expiry_date")
    .eq("driver_id", driverId);

  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  let valid = 0,
    expiringSoon = 0,
    expired = 0;

  data?.forEach((permit) => {
    const expiry = new Date(permit.expiry_date);
    if (expiry < today) expired++;
    else if (expiry <= in30Days) expiringSoon++;
    else valid++;
  });

  return { valid, expiringSoon, expired };
};

// ── NEW FUNCTIONS ─────────────────────────────────────────────────────────────

export const getDriverBids = async (driverId) => {
  const { data, error } = await supabase
    .from("bids")
    .select(
      `
      id,
      shipment_id,
      bid_price,
      eta_hours,
      status,
      created_at,
      shipments!bids_shipment_id_fkey (
        pickup_location,
        drop_location,
        status
      )
    `,
    )
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getDriverBids join error:", error.message);

    // Fallback without join
    const { data: fallback, error: fallbackError } = await supabase
      .from("bids")
      .select("id, shipment_id, bid_price, eta_hours, status, created_at")
      .eq("driver_id", driverId)
      .order("created_at", { ascending: false });

    if (fallbackError) throw fallbackError;
    return fallback;
  }

  return data;
};

export const getDriverTrips = async (driverId) => {
  const { data: trips, error: tripError } = await supabase
    .from("trips")
    .select(
      `
      id,
      shipment_id,
      earning_amount,
      completed_at,
      shipments!trips_shipment_id_fkey (
        pickup_location,
        drop_location
      )
    `,
    )
    .eq("driver_id", driverId)
    .order("completed_at", { ascending: false });

  if (tripError) {
    console.error("getDriverTrips join error:", tripError.message);

    // Fallback without join
    const { data: fallback, error: fallbackError } = await supabase
      .from("trips")
      .select("id, shipment_id, earning_amount, completed_at")
      .eq("driver_id", driverId)
      .order("completed_at", { ascending: false });

    if (fallbackError) throw fallbackError;
    return fallback.map((t) => ({ ...t, shipments: null, rating: null }));
  }

  // Fetch ratings for each trip
  const shipmentIds = trips.map((t) => t.shipment_id).filter(Boolean);
  let ratingsMap = {};

  if (shipmentIds.length > 0) {
    const { data: ratings } = await supabase
      .from("ratings")
      .select("shipment_id, rating")
      .eq("driver_id", driverId)
      .in("shipment_id", shipmentIds);

    ratingsMap = (ratings ?? []).reduce((acc, r) => {
      acc[r.shipment_id] = r.rating;
      return acc;
    }, {});
  }

  return trips.map((t) => ({
    ...t,
    rating: ratingsMap[t.shipment_id] ?? null,
  }));
};

export const getDriverActiveShipments = async (driverId) => {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("assigned_driver_id", driverId)
    .in("status", ["assigned", "in_transit"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};
