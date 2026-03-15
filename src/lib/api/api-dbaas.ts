import { runtimeEnv } from "@/lib/runtime-env";

const baseURL = runtimeEnv("VITE_DBAAS_API_URL");

export type ApiError = {
  message?: string;
  error?: string;
  code?: string;
};

export type DbaasInstance = {
  id: string;
  name: string;
  owner_id: string;
  engine: string;
  version: string;
  instance_count: number;
  plan: string;
  storage_gb: number;
  database_name: string;
  username: string;
  password_secret_ref: string;
  status: string;
  platform_workload_id: string;
  cluster_id: string;
  namespace: string;
  endpoint: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DbaasInstanceStatus = {
  instance: DbaasInstance;
  platform_status?: {
    phase?: string;
    desired_replicas?: number;
    ready_replicas?: number;
    [key: string]: unknown;
  };
};

type Envelope<T> = {
  data?: T;
};

class HttpError extends Error {
  status: number;
  payload?: ApiError;

  constructor(status: number, message: string, payload?: ApiError) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const asNullableString = (value: unknown) =>
  typeof value === "string" ? value : null;

const unwrapData = <T>(payload: unknown): T | undefined => {
  const record = asRecord(payload);
  if ("data" in record) {
    return record.data as T | undefined;
  }
  return payload as T;
};

const normalizeInstance = (raw: unknown): DbaasInstance => {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    name: asString(row.name),
    owner_id: asString(row.owner_id),
    engine: asString(row.engine),
    version: asString(row.version),
    instance_count: asNumber(row.instance_count),
    plan: asString(row.plan),
    storage_gb: asNumber(row.storage_gb),
    database_name: asString(row.database_name),
    username: asString(row.username),
    password_secret_ref: asString(row.password_secret_ref),
    status: asString(row.status),
    platform_workload_id: asString(row.platform_workload_id),
    cluster_id: asString(row.cluster_id),
    namespace: asString(row.namespace),
    endpoint: asString(row.endpoint),
    created_at: asNullableString(row.created_at),
    updated_at: asNullableString(row.updated_at),
  };
};

const parseApiError = (raw: unknown): ApiError | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  if (row.error && typeof row.error === "object") {
    const nested = row.error as Record<string, unknown>;
    return {
      code: typeof nested.code === "string" ? nested.code : undefined,
      message: typeof nested.message === "string" ? nested.message : undefined,
      error: typeof nested.error === "string" ? nested.error : undefined,
    };
  }
  return {
    code: typeof row.code === "string" ? row.code : undefined,
    message: typeof row.message === "string" ? row.message : undefined,
    error: typeof row.error === "string" ? row.error : undefined,
  };
};

const joinURL = (prefix: string, path: string) => {
  const left = prefix.trim().replace(/\/+$/, "");
  const right = path.trim().replace(/^\/+/, "");
  if (!left) return `/${right}`;
  return `${left}/${right}`;
};

const httpRequest = async <T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string | number | undefined>,
): Promise<T> => {
  const url = new URL(joinURL(baseURL, path), window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const rawText = await response.text();
  const parsed = rawText ? (JSON.parse(rawText) as unknown) : undefined;

  if (!response.ok) {
    const payload = parseApiError(parsed);
    const message =
      payload?.message ?? payload?.error ?? `HTTP ${response.status}`;
    throw new HttpError(response.status, message, payload);
  }

  return parsed as T;
};

export function getErrorMessage(error: unknown, fallback = "Request failed") {
  if (error instanceof HttpError) {
    return error.payload?.message ?? error.payload?.error ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

export async function listDbaasInstances(ownerID: string): Promise<DbaasInstance[]> {
  const payload = await httpRequest<Envelope<{ items?: unknown[] }> | unknown>(
    "/dbaas/instances",
    { method: "GET" },
    { owner_id: ownerID },
  );
  const data = unwrapData<{ items?: unknown[] } | unknown[]>(payload);
  const items = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data).items)
      ? (asRecord(data).items as unknown[])
      : [];
  return items.map(normalizeInstance).filter((item) => item.id.length > 0);
}

export async function createDbaasInstance(payload: {
  name: string;
  owner_id: string;
  engine: string;
  version: string;
  instance_count: number;
  plan: string;
  storage_gb: number;
  database_name: string;
  username: string;
  password_secret_ref: string;
  domain: string;
}): Promise<DbaasInstance> {
  const data = await httpRequest<Envelope<unknown>>("/dbaas/instances", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeInstance(unwrapData<unknown>(data));
}

export async function getDbaasInstanceStatus(
  instanceID: string,
): Promise<DbaasInstanceStatus> {
  const data = await httpRequest<Envelope<unknown>>(
    `/dbaas/instances/${instanceID}/status`,
    { method: "GET" },
  );
  const row = asRecord(unwrapData<unknown>(data));
  return {
    instance: normalizeInstance(row.instance),
    platform_status:
      row.platform_status && typeof row.platform_status === "object"
        ? (row.platform_status as {
            phase?: string;
            desired_replicas?: number;
            ready_replicas?: number;
            [key: string]: unknown;
          })
        : undefined,
  };
}

export async function deleteDbaasInstance(instanceID: string): Promise<void> {
  await httpRequest(`/dbaas/instances/${instanceID}`, { method: "DELETE" });
}

export default {
  listDbaasInstances,
  createDbaasInstance,
  getDbaasInstanceStatus,
  deleteDbaasInstance,
};
