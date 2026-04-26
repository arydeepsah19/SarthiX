import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

function fmtDate(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function fmtDeadline(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normaliseOne(s) {
  const pickup = s.pickup_location ?? "–";
  const drop = s.drop_location ?? "–";
  return {
    id: s.id,
    route: `${pickup} → ${drop}`,
    pickup,
    drop,
    status: s.status ?? "open",
    posted: fmtDate(s.created_at),
    loadType: s.load_type ?? "",
    weightKg: s.weight_kg ?? s.weight ?? "",
    distanceKm: s.distance_km ?? "",
    basePrice: s.base_price
      ? `₹${Number(s.base_price).toLocaleString("en-IN")}`
      : null,
    minBid: s.min_bid_price
      ? `₹${Number(s.min_bid_price).toLocaleString("en-IN")}`
      : null,
    minBidRaw: s.min_bid_price ?? null,
    deadline: s.bidding_deadline ?? null,
    deadlineFmt: fmtDeadline(s.bidding_deadline),
    images: s.images ?? [],
    companyId: s.company_id,
    driverId: s.assigned_driver_id ?? null,
    bids: s.bid_count ?? 0,
    shipperName: s.company?.name ?? null,
    shipperAvatar: s.company?.avatar_url ?? null,
  };
}

// ── DRIVER: GET /shipments — all open shipments for bidding ───────────────────
export function useShipments() {
  const axios = useAxios();
  return useQuery({
    queryKey: ["shipments", "open"], // ← separate key so it doesn't share cache with other queries
    queryFn: async () => {
      const { data } = await axios.get("/shipments");
      return Array.isArray(data) ? data.map(normaliseOne) : [];
    },
    staleTime: 0, // always refetch fresh so company join data is never stale
  });
}

// ── COMPANY: GET /company/shipments — only this company's shipments ───────────
export function useCompanyShipments() {
  const axios = useAxios();
  return useQuery({
    queryKey: ["company", "shipments"],
    queryFn: async () => {
      const { data } = await axios.get("/shipments/myshipments");
      return Array.isArray(data) ? data.map(normaliseOne) : [];
    },
  });
}

// GET /shipments/:id
export function useShipmentDetail(shipmentId) {
  const axios = useAxios();
  return useQuery({
    queryKey: ["shipments", shipmentId],
    queryFn: async () => {
      const { data } = await axios.get(`/shipments/${shipmentId}`);
      return normaliseOne(data);
    },
    enabled: !!shipmentId,
  });
}

// POST /shipments
export function usePostShipment() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentData) => axios.post("/shipments", shipmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", "shipments"] });
      queryClient.invalidateQueries({ queryKey: ["company", "dashboard"] });
    },
  });
}

// PATCH /shipments/:id/status
export function useUpdateShipmentStatus() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, status }) =>
      axios.patch(`/shipments/${shipmentId}/status`, { status }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["company", "shipments"] });
      queryClient.invalidateQueries({
        queryKey: ["shipments", vars.shipmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["driver", "dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["driver", "active-shipments"],
      }); // ← refresh active list
    },
  });
}
