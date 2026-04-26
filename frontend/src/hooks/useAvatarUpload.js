import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/**
 * Upload avatar to Supabase Storage and save URL to DB.
 *
 * Flow:
 *  1. Upload file to Supabase Storage bucket "avatars"
 *  2. Get public URL
 *  3. PATCH /users/avatar { avatar_url }  → saves to users table
 *  4. Invalidate currentUser query so ProfilePage refreshes
 */
export function useAvatarUpload() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, userId }) => {
      // 1. Upload to Supabase Storage
      const ext = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true }); // upsert=true replaces old avatar

      if (uploadError) throw new Error(uploadError.message);

      // 2. Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      // 3. Save URL to DB via PATCH /users/avatar
      await axios.patch("/users/avatar", { avatar_url: avatarUrl });

      return avatarUrl;
    },

    onSuccess: () => {
      // Refresh currentUser so the new avatar shows everywhere
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
