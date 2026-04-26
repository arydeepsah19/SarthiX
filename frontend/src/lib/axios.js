import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

export const useAxios = () => {
  const { getToken } = useAuth();

  const instance = useMemo(() => {
    const client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    client.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return client;
  }, [getToken]);

  return instance;
};
