import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";

const baseURL =
  import.meta.env.VITE_UMS_API_URL?.toString() ??
  import.meta.env.VITE_API_URL?.toString() ??
  "http://localhost:3000";

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as (typeof error.config & {
      _retry?: boolean;
    });

    if (!original || status !== 401) {
      return Promise.reject(error);
    }

    if (original._retry) {
      return Promise.reject(error);
    }

    if (
      typeof original.url === "string" &&
      (original.url.includes("/auth/refresh") ||
        original.url.includes("/auth/login") ||
        original.url.includes("/auth/register") ||
        original.url.includes("/auth/forgot-password") ||
        original.url.includes("/auth/reset-password/verify") ||
        original.url.includes("/auth/new-password") ||
        original.url.includes("/auth/mfa/challenge/verify") ||
        original.url.includes("/auth/active"))
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post("/auth/refresh", {}).then(() => undefined);
      }
      await refreshPromise;
      refreshPromise = null;
      return api.request(original);
    } catch (refreshError) {
      refreshPromise = null;
      return Promise.reject(refreshError);
    }
  },
);

export type ApiError = {
  message?: string;
  error?: string;
};

export function getErrorMessage(error: unknown, fallback = "Request failed") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.message ?? data?.error ?? error.message ?? fallback;
  }
  return fallback;
}

export function post<TResponse, TBody = unknown>(path: string, body: TBody) {
  return api.post<TResponse>(path, body);
}

export default api;
