import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";
import { useAuth } from "@clerk/clerk-react";

export function useCurrentUser() {
  const { isSignedIn } = useAuth(); // always called — no conditions
  const axios = useAxios(); // always called — no conditions

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axios.get("/users/me");
      return res.data;
    },
    enabled: isSignedIn === true, // query only runs when signed in, but hook always called
    staleTime: 0,
    retry: 1,
  });
}
