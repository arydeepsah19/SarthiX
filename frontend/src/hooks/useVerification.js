import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

// ── Upload verification doc to Supabase Storage → returns public URL ──────────
// Mirrors the exact same pattern as uploadFileToSupabase in useShipmentImages.js
export async function uploadVerificationDoc(file, userId) {
  const { createClient } = await import("@supabase/supabase-js");

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  const ext = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("verification-docs") // create this bucket in Supabase Storage
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("verification-docs")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ── PATCH /users/submit-verification ─────────────────────────────────────────
export function useSubmitVerification() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      aadhaar_number,
      license_number,
      verification_doc_url,
    }) => {
      const { data } = await axios.patch("/users/submit-verification", {
        aadhaar_number,
        license_number,
        verification_doc_url,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
