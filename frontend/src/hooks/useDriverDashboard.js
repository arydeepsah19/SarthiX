import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function normalise(raw) {
  return {
    stats: {
      activeBids: raw.activeBids ?? 0,
      activeShipments: raw.activeShipments ?? 0,
      tripsCompleted: raw.tripsCompleted ?? 0,
      totalEarnings: formatINR(raw.totalEarnings ?? 0),
    },
    rating: raw.rating ?? 0,
    ratingCount: 0,
    permits: raw.permits ?? { valid: 0, expiringSoon: 0, expired: 0 },
  };
}

export function useDriverDashboard() {
  const axios = useAxios();

  return useQuery({
    queryKey: ["driver", "dashboard"],
    queryFn: async () => {
      const { data } = await axios.get("/driver/dashboard");
      return normalise(data);
    },
  });
}

// ── Driver active shipments (assigned + in_transit) ───────────────────────────
function normaliseShipment(s) {
  const pickup = s.pickup_location ?? "–";
  const drop = s.drop_location ?? "–";
  return {
    id: s.id,
    route: `${pickup} → ${drop}`,
    pickup,
    drop,
    status: s.status,
    loadType: s.load_type ?? "",
    weightKg: s.weight_kg ?? "",
    distanceKm: s.distance_km ?? "",
    basePrice: s.base_price
      ? `₹${Number(s.base_price).toLocaleString("en-IN")}`
      : null,
    earning: s.bid_price
      ? `₹${Number(s.bid_price).toLocaleString("en-IN")}`
      : null,
  };
}

export function useDriverActiveShipments() {
  const axios = useAxios();
  return useQuery({
    queryKey: ["driver", "active-shipments"],
    queryFn: async () => {
      const { data } = await axios.get("/driver/active-shipments");
      return Array.isArray(data) ? data.map(normaliseShipment) : [];
    },
    refetchInterval: 30000, // refresh every 30s to catch new assignments
  });
}
