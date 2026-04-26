// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useAxios } from "../lib/axios.js";

// function normalise(raw = []) {
//   return raw.map((v) => ({
//     id: v.id,
//     reg: v.registration_number ?? v.reg ?? "",
//     type: v.vehicle_type ?? v.type ?? "",
//     capacity: v.capacity ?? "",
//     status: v.status ?? "idle",
//     documentUrl: v.document_url ?? null, // ← new
//   }));
// }

// export function useVehicles() {
//   const axios = useAxios();
//   return useQuery({
//     queryKey: ["vehicles"],
//     queryFn: async () => {
//       const { data } = await axios.get("/vehicles");
//       return normalise(data);
//     },
//   });
// }

// export function useAddVehicle() {
//   const axios = useAxios();
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (vehicleData) => axios.post("/vehicles", vehicleData),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
//   });
// }

// export function useEditVehicle() {
//   const axios = useAxios();
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, ...updates }) => axios.patch(`/vehicles/${id}`, updates),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
//   });
// }

// export function useDeleteVehicle() {
//   const axios = useAxios();
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id) => axios.delete(`/vehicles/${id}`),
//     onMutate: async (id) => {
//       await queryClient.cancelQueries({ queryKey: ["vehicles"] });
//       const previous = queryClient.getQueryData(["vehicles"]);
//       queryClient.setQueryData(["vehicles"], (old = []) =>
//         old.filter((v) => v.id !== id),
//       );
//       return { previous };
//     },
//     onError: (_e, _id, ctx) =>
//       queryClient.setQueryData(["vehicles"], ctx.previous),
//     onSettled: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
//   });
// }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

function normalise(raw = []) {
  return raw.map((v) => ({
    id: v.id,
    reg: v.vehicle_number ?? v.registration_number ?? "", // ← table uses vehicle_number
    type: v.vehicle_type ?? "",
    capacity: v.capacity_kg ?? v.capacity ?? "", // ← table uses capacity_kg
    status: v.status ?? "idle",
    documentUrl: v.document_url ?? null,
  }));
}

export function useVehicles() {
  const axios = useAxios();
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await axios.get("/vehicles");
      return normalise(data);
    },
  });
}

export function useAddVehicle() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleData) => axios.post("/vehicles", vehicleData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useEditVehicle() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }) => axios.patch(`/vehicles/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useDeleteVehicle() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => axios.delete(`/vehicles/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["vehicles"] });
      const previous = queryClient.getQueryData(["vehicles"]);
      queryClient.setQueryData(["vehicles"], (old = []) =>
        old.filter((v) => v.id !== id),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) =>
      queryClient.setQueryData(["vehicles"], ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

// ── Upload document (PDF/DOCX) to Supabase Storage ────────────────────────────
export async function uploadVehicleDocument(file, vehicleId) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  const ext = file.name.split(".").pop().toLowerCase();
  const fileName = `private/${vehicleId ?? "new"}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("vehicle-documents")
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("vehicle-documents")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ── Update phone number in users table ───────────────────────────────────────
export function useUpdatePhone() {
  const axios = useAxios();
  return useMutation({
    mutationFn: (phoneNumber) =>
      axios.patch("/users/phone", { phone_number: phoneNumber }),
  });
}