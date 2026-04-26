import { useMutation, useQueryClient ,useQuery} from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

// POST /ratings
// export function useRateShipment() {
//   const axios = useAxios();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ shipmentId, rating, comment }) =>
//       axios.post("/ratings", { shipment_id: shipmentId, rating, comment }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["shipments"] });
//       queryClient.invalidateQueries({ queryKey: ["driver", "dashboard"] });
//       queryClient.invalidateQueries({ queryKey: ["company", "dashboard"] });
//     },
//   });
// }
export function useHasRated(shipmentId) {
  const axios = useAxios();
  return useQuery({
    queryKey: ["rating-check", shipmentId],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/ratings/check", {
          params: { shipment_id: shipmentId },
        });
        return data?.rated ?? false;
      } catch {
        return false;
      }
    },
    enabled: !!shipmentId,
    staleTime: 1000 * 60 * 5, // 5 min — rating status doesn't change often
  });
}

// ── POST /ratings — submit a new rating ──────────────────────────────────────
export function useSubmitRating() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shipment_id, rating, comment }) => {
      const { data } = await axios.post("/ratings", {
        shipment_id,
        rating,
        comment,
      });
      return data;
    },
    onSuccess: (_data, vars) => {
      // Mark as rated so the button flips to "✓ Rated"
      queryClient.setQueryData(["rating-check", vars.shipment_id], true);
      // Refresh company shipments so the card updates
      queryClient.invalidateQueries({ queryKey: ["company", "shipments"] });
    },
  });
}
 

