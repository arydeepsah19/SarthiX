import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Backend join returns shipments with: pickup_location, drop_location
function normalise(raw = []) {
  return raw.map((t) => {
    const s = t.shipments ?? {};
    const pickup = s.pickup_location ?? "–";
    const drop = s.drop_location ?? "–"; // ← correct column

    return {
      id: t.id,
      route: `${pickup} → ${drop}`, // ← both sides now visible
      date: fmtDate(t.completed_at), // ← renamed from 'date' to 'completed_at' for clarity
      earning: `₹${Number(t.earning_amount).toLocaleString("en-IN")}`,
      rating: t.rating ?? 0,
    };
  });
}

export function useDriverTrips() {
  const axios = useAxios();

  return useQuery({
    queryKey: ["driver", "trips"],
    queryFn: async () => {
      const { data } = await axios.get("/driver/trips");
      return normalise(data);
    },
    staleTime: 1000 * 60 * 5,
  });
}
