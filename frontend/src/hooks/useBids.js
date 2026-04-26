import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

// ── Normalise bid list (shipper view) ─────────────────────────────────────────
function normaliseBids(raw = []) {
  return raw.map((b) => {
    const u = b.users ?? {};
    return {
      id: b.id,
      driverId: b.driver_id,
      driver:
        u.name ??
        b.driver_name ??
        b.name ??
        `Driver #${String(b.driver_id).slice(0, 8)}`,
      avatarUrl: u.avatar_url ?? null,
      rating: Number(u.rating ?? b.driver_rating ?? 0),
      tripsCompleted: u.trips_completed ?? b.trips_completed ?? null,
      eta: b.eta_hours ? `${b.eta_hours} hrs` : "–",
      price: `₹${Number(b.bid_price).toLocaleString("en-IN")}`,
      priceRaw: Number(b.bid_price),
      status: b.status ?? "pending",
      created_at: b.created_at ?? null,
      updated_at: b.updated_at ?? null,
      // ── verification fields ──
      isVerified: u.is_verified ?? false,
      verificationStatus: u.verification_status ?? "unverified",
    };
  });
}

// ── GET /driver/bids — all bids placed by the current driver ──────────────────
function normaliseDriverBids(raw = []) {
  return raw.map((b) => {
    const s = b.shipments ?? {};
    const pickup = s.pickup_location ?? "–";
    const drop = s.drop_location ?? "–";
    return {
      id: b.id,
      shipmentId: b.shipment_id,
      shipment: `SHP-${String(b.shipment_id).slice(0, 5).toUpperCase()}`,
      route: `${pickup} → ${drop}`,
      price: `₹${Number(b.bid_price).toLocaleString("en-IN")}`,
      eta: b.eta_hours ? `${b.eta_hours} hrs` : "–",
      status: b.status ?? "pending",
    };
  });
}

export function useDriverBids() {
  const axios = useAxios();
  return useQuery({
    queryKey: ["driver", "bids"],
    queryFn: async () => {
      const { data } = await axios.get("/driver/bids");
      return normaliseDriverBids(data);
    },
    staleTime: 1000 * 30,
  });
}

// ── GET /bids/:shipmentId — all bids for a shipment (shipper view) ────────────
export function useBidsForShipment(shipmentId) {
  const axios = useAxios();
  return useQuery({
    queryKey: ["bids", shipmentId],
    queryFn: async () => {
      const { data } = await axios.get(`/bids/${shipmentId}`);
      return normaliseBids(data);
    },
    enabled: !!shipmentId,
    refetchInterval: 1000 * 30,
  });
}

// ── GET /bids/my?shipment_id=x — the current driver's own bid ────────────────
export function useMyBidForShipment(shipmentId) {
  const axios = useAxios(); // ← fix: must use the hook, not bare axios
  return useQuery({
    queryKey: ["my-bid", shipmentId],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/bids/my", {
          params: { shipment_id: shipmentId },
        });
        return data ?? null; // raw DB row: { id, bid_price, eta_hours, ... }
      } catch (err) {
        // 404 means no bid yet — treat as null, don't throw
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!shipmentId,
    staleTime: 30_000,
  });
}

// ── POST /bids — place a new bid ──────────────────────────────────────────────
export function usePlaceBid() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, bidPrice, etaHours }) =>
      axios.post("/bids", {
        shipment_id: shipmentId,
        bid_price: bidPrice,
        eta_hours: etaHours,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["bids", vars.shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["my-bid", vars.shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["driver", "dashboard"] });
    },
  });
}

// ── PATCH /bids/:bidId — edit an existing bid (driver only) ──────────────────
export function useUpdateBid() {
  const axios = useAxios(); // ← fix: must use the hook, not bare axios
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bidId, shipmentId, bidPrice, etaHours }) => {
      const { data } = await axios.patch(`/bids/${bidId}`, {
        bid_price: bidPrice,
        eta_hours: etaHours,
      });
      return data;
    },
    onSuccess: (_data, vars) => {
      // Refresh driver's own bid summary card
      queryClient.invalidateQueries({ queryKey: ["my-bid", vars.shipmentId] });
      // Refresh shipper's bids dialog so new price appears immediately
      queryClient.invalidateQueries({ queryKey: ["bids", vars.shipmentId] });
    },
  });
}

// ── POST /bids/accept — shipper accepts a bid ─────────────────────────────────
export function useAcceptBid() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bidId, shipmentId }) =>
      axios.post("/bids/accept", { bidId, shipmentId }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["bids", vars.shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["company", "dashboard"] });
    },
  });
}
