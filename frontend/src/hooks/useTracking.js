import { useEffect, useRef } from "react";
import { useAxios } from "../lib/axios.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Driver: push GPS for ALL in_transit shipments every 10 seconds ───────────
// shipmentIds: string[]  — all shipment IDs currently in_transit
export function useLocationBroadcast(shipmentIds = []) {
  const axios = useAxios();
  const watchRef = useRef(null);
  const latestPos = useRef(null);
  const intervalRef = useRef(null);
  // Keep a stable ref to the ids so the interval closure always has latest list
  const idsRef = useRef(shipmentIds);
  useEffect(() => {
    idsRef.current = shipmentIds;
  }, [shipmentIds]);

  useEffect(() => {
    // No active in_transit shipments — stop everything
    if (shipmentIds.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      intervalRef.current = null;
      watchRef.current = null;
      return;
    }

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    // Watch GPS position — one watcher for all shipments
    if (!watchRef.current) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          latestPos.current = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
        },
        (err) => console.warn("GPS error:", err.message),
        { enableHighAccuracy: true, maximumAge: 5000 },
      );
    }

    // Push location to ALL in_transit shipments every 10s
    const push = async () => {
      if (!latestPos.current || !idsRef.current.length) return;
      await Promise.allSettled(
        idsRef.current.map((id) =>
          axios
            .patch(`/shipments/${id}/location`, latestPos.current)
            .catch((e) =>
              console.warn(`Location push failed for ${id}:`, e.message),
            ),
        ),
      );
    };

    push(); // immediate first push
    if (!intervalRef.current) {
      intervalRef.current = setInterval(push, 10000);
    }

    return () => {
      clearInterval(intervalRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      intervalRef.current = null;
      watchRef.current = null;
    };
    // Only re-run if shipments go from 0→n or n→0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentIds.length === 0]);
}

// ── Shipper: subscribe to Supabase Realtime for live location updates ─────────
export function useLiveLocation(shipmentId) {
  const axios = useAxios();
  const queryClient = useQueryClient();

  // Initial fetch
  const query = useQuery({
    queryKey: ["location", shipmentId],
    queryFn: async () => {
      const { data } = await axios.get(`/shipments/${shipmentId}/location`);
      return data; // { lat, lng, updated_at } or null
    },
    enabled: !!shipmentId,
    refetchInterval: 10000, // poll every 10s as fallback if realtime fails
  });

  // Supabase Realtime subscription
  useEffect(() => {
    if (!shipmentId) return;

    let subscription;
    const setup = async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
        );

        subscription = supabase
          .channel(`location:${shipmentId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "shipment_locations",
              filter: `shipment_id=eq.${shipmentId}`,
            },
            (payload) => {
              // Update cache instantly when driver moves
              queryClient.setQueryData(["location", shipmentId], payload.new);
            },
          )
          .subscribe();
      } catch (e) {
        console.warn("Realtime setup failed:", e.message);
      }
    };

    setup();
    return () => {
      subscription?.unsubscribe();
    };
  }, [shipmentId]);

  return query;
}
