import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../lib/axios.js";

function formatTime(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return new Date(isoString).toLocaleDateString("en-IN");
}

function normalise(raw = []) {
  return raw.map((n) => ({
    id: n.id,
    msg: n.message,
    time: formatTime(n.created_at),
    read: n.is_read ?? false,
  }));
}

export function useNotifications() {
  const axios = useAxios();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axios.get("/notifications");
      console.log("Notifications fetched:", data);
      return normalise(data);
    },
  });
}

export function useMarkNotificationRead() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      console.log("Calling PATCH /notifications/" + id + "/read");
      const res = await axios.patch(`/notifications/${id}/read`);
      console.log("PATCH response:", res.data);
      return res.data;
    },

    onMutate: async (id) => {
      console.log("onMutate - optimistic update for id:", id);
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { previous };
    },

    onSuccess: (_data, id) => {
      console.log("onSuccess - confirming read for id:", id);
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },

    onError: (err, _id, ctx) => {
      console.error("onError - rolling back:", err.message);
      queryClient.setQueryData(["notifications"], ctx.previous);
    },
  });
}
