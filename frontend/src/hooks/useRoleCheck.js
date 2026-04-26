import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export const useRoleCheck = () => {
  const { getToken, isSignedIn } = useAuth();
  const [role, setRoleState] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const requestIdRef = useRef(0);

  const setRole = useCallback((nextRole) => {
    requestIdRef.current += 1;
    setRoleState(nextRole);
    setLoading(false);
  }, []);

  const refreshRole = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!isSignedIn) {
      if (requestId === requestIdRef.current) {
        setRoleState(null);
        setLoading(false);
      }
      return null;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (requestId !== requestIdRef.current) {
        return null;
      }

      if (!res.ok) {
        setRoleState(null);
        return null;
      }

      const data = await res.json();
      const nextRole = data.role ?? null;
      setRoleState(nextRole);
      return nextRole;
    } catch (err) {
      if (requestId === requestIdRef.current) {
        console.error("useRoleCheck error:", err);
        setRoleState(null);
      }
      return null;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [apiUrl, getToken, isSignedIn]);

  useEffect(() => {
    refreshRole();
  }, [refreshRole]);

  return { role, loading, refreshRole, setRole };
};
