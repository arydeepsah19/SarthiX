import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

function deriveStatus(expiryDate) {
  if (!expiryDate) return "active";
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);
  const expiry = new Date(expiryDate);
  if (expiry < today) return "expired";
  if (expiry <= in30Days) return "warning";
  return "active";
}

function daysUntil(expiryDate) {
  if (!expiryDate) return null;
  return Math.floor((new Date(expiryDate) - new Date()) / 86400000);
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalise(raw = []) {
  return raw.map((p) => ({
    id: p.id,
    type: p.permit_type,
    number: p.permit_number,
    from: fmtDate(p.valid_from),
    expiry: fmtDate(p.expiry_date),
    status: deriveStatus(p.expiry_date),
    daysLeft: daysUntil(p.expiry_date),
  }));
}

export function usePermits() {
  const axios = useAxios();

  return useQuery({
    queryKey: ["permits"],
    queryFn: async () => {
      const { data } = await axios.get("/permits");
      return normalise(data);
    },
  });
}

export function useAddPermit() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permitData) => axios.post("/permits", permitData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits"] }),
  });
}
