import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

export const useUserSync = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const syncPromiseRef = useRef(null);

  const syncUser = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !user) {
      return null;
    }

    if (isSynced) {
      return user;
    }

    if (syncPromiseRef.current) {
      return syncPromiseRef.current;
    }

    syncPromiseRef.current = (async () => {
      setIsSyncing(true);

      try {
        const token = await getToken();

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: user.fullName || user.firstName || user.username || "User",
          }),
        });

        if (!response.ok) {
          throw new Error(`User sync failed with status ${response.status}`);
        }

        setIsSynced(true);
        return response.json();
      } finally {
        setIsSyncing(false);
        syncPromiseRef.current = null;
      }
    })();

    return syncPromiseRef.current;
  }, [getToken, isLoaded, isSignedIn, isSynced, user]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || isSynced) {
      return;
    }

    syncUser().catch((err) => {
      console.error("User sync failed:", err);
    });
  }, [isLoaded, isSignedIn, isSynced, syncUser, user]);

  return { syncUser, isSyncing, isSynced };
};
