import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function normalise(raw) {
  return {
    stats: {
      total: raw.totalShipments ?? 0,
      active: raw.activeShipments ?? 0,
      completed: raw.completedShipments ?? 0,
      cancelled: raw.cancelledShipments ?? 0,
      spent: formatINR(raw.totalSpent ?? 0),
    },
  };
}

export function useCompanyDashboard() {
  const axios = useAxios();

  return useQuery({
    queryKey: ["company", "dashboard"],
    queryFn: async () => {
      const { data } = await axios.get("/company/dashboard");
      return normalise(data);
    },
  });
}
