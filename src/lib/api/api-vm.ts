import axios from "axios";
import type { AxiosInstance } from "axios";

const baseURL =
  import.meta.env.VITE_VM_API_URL?.toString() ?? "http://localhost:3001/api/v1";

const apiVM: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

export type ApiError = {
  message?: string;
  error?: string;
};

export type VmStatus = "running" | "stopped" | "provisioning" | "error";

export type VmItem = {
  id: string;
  name: string;
  status: VmStatus;
  region?: string;
  image?: string;
  flavor?: string;
  flavor_name?: string;
  public_ip?: string;
  private_ip?: string;
  cpu?: number;
  memory_gb?: number;
  disk_gb?: number;
  total_disk_gb?: number;
  created_at?: string;
};

export type VmListResponse = {
  data?: VmItem[] | { vms?: VmItem[]; items?: VmItem[] };
  vms?: VmItem[];
  items?: VmItem[];
};

export type VmListParams = {
  owner_user_id?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export function getErrorMessage(error: unknown, fallback = "Request failed") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.message ?? data?.error ?? error.message ?? fallback;
  }
  return fallback;
}

export async function listVMs(
  path = "/vms",
  params?: VmListParams,
): Promise<VmItem[]> {
  const res = await apiVM.get<VmListResponse>(path, { params });
  const payload = res.data;
  const arrayPayload = Array.isArray(payload?.data)
    ? payload.data
    : (payload?.data?.vms ??
      payload?.data?.items ??
      payload?.vms ??
      payload?.items);
  return Array.isArray(arrayPayload) ? arrayPayload : [];
}

export default apiVM;
