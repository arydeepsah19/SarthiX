import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

// POST /shipments/:id/images
export function useUploadShipmentImage(shipmentId) {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUrl) =>
      axios.post(`/shipments/${shipmentId}/images`, { image_url: imageUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}

// DELETE /shipments/:shipmentId/images/:imageId
export function useDeleteShipmentImage(shipmentId) {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId) =>
      axios.delete(`/shipments/${shipmentId}/images/${imageId}`),

    // Optimistic update — remove from cache instantly
    onMutate: async (imageId) => {
      await queryClient.cancelQueries({ queryKey: ["shipments", shipmentId] });
      const previous = queryClient.getQueryData(["shipments", shipmentId]);

      queryClient.setQueryData(["shipments", shipmentId], (old) => {
        if (!old) return old;
        return {
          ...old,
          images: (old.images ?? []).filter((img) => img.id !== imageId),
        };
      });

      return { previous };
    },
    onError: (_err, _imageId, ctx) => {
      queryClient.setQueryData(["shipments", shipmentId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}

// Upload file to Supabase Storage → returns public URL
export async function uploadFileToSupabase(file, shipmentId) {
  const { createClient } = await import("@supabase/supabase-js");

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  const ext = file.name.split(".").pop();
  const fileName = `${shipmentId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("shipment-images")
    .upload(fileName, file, { upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("shipment-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
