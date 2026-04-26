import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

// Backend join returns shipments with: pickup_location, drop_location
function normalise(raw = []) {
  return raw.map((b) => {
    const s = b.shipments ?? {};
    const pickup = s.pickup_location ?? "–";
    const drop = s.drop_location ?? "–"; // ← correct column

    return {
      id: b.id,
      shipmentId: b.shipment_id,
      shipment: `SHP-${String(b.shipment_id).slice(0, 5).toUpperCase()}`,
      route: `${pickup} → ${drop}`, // ← both sides now visible
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
      return normalise(data);
    },
    staleTime: 1000 * 30,
  });
}
