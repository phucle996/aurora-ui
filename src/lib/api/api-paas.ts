import { runtimeEnv } from "@/lib/runtime-env";

const baseURL = runtimeEnv("VITE_PAAS_API_URL");
const requestTimeoutMs = 20000;

export type ApiError = {
  message?: string;
  error?: string;
  code?: string;
};

export type PaasApp = {
  id: string;
  name: string;
  owner_id: string;
  git_repository: string;
  default_branch: string;
  runtime: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PaasBuild = {
  id: string;
  app_id: string;
  commit_sha: string;
  branch: string;
  status: "pending" | "running" | "success" | "failed" | string;
  image_tag: string;
  build_logs: string;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PaasRelease = {
  id: string;
  app_id: string;
  build_id: string;
  image_tag: string;
  version: string;
  created_at?: string | null;
};

export type PaasDeployment = {
  id: string;
  app_id: string;
  release_id: string;
  platform_workload_id: string;
  cluster_id: string;
  namespace: string;
  domain: string;
  status: string;
  created_at?: string | null;
};

export type PaasAppStatus = {
  app_id: string;
  deployment_id: string;
  release_id: string;
  platform_workload_id: string;
  status: string;
  platform?: {
    phase?: string;
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

const asNullableString = (value: unknown) =>
  typeof value === "string" ? value : null;

const unwrapData = <T>(payload: unknown): T | undefined => {
  const record = asRecord(payload);
  if ("data" in record) {
    return record.data as T | undefined;
  }
  return payload as T;
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

const parseJSON = (rawText: string): unknown => {
  if (!rawText) return undefined;
  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return undefined;
  }
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

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(url.toString(), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      credentials: "include",
      signal: controller.signal,
    });

    const rawText = await response.text();
    const parsed = parseJSON(rawText);

    if (!response.ok) {
      const payload = parseApiError(parsed);
      const message =
        payload?.message ?? payload?.error ?? `HTTP ${response.status}`;
      throw new HttpError(response.status, message, payload);
    }

    return parsed as T;
  } finally {
    window.clearTimeout(timer);
  }
};

const normalizeApp = (raw: unknown): PaasApp => {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    name: asString(row.name),
    owner_id: asString(row.owner_id),
    git_repository: asString(row.git_repository),
    default_branch: asString(row.default_branch),
    runtime: asString(row.runtime),
    created_at: asNullableString(row.created_at),
    updated_at: asNullableString(row.updated_at),
  };
};

const normalizeBuild = (raw: unknown): PaasBuild => {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    app_id: asString(row.app_id),
    commit_sha: asString(row.commit_sha),
    branch: asString(row.branch),
    status: asString(row.status),
    image_tag: asString(row.image_tag),
    build_logs: asString(row.build_logs),
    started_at: asNullableString(row.started_at),
    finished_at: asNullableString(row.finished_at),
    created_at: asNullableString(row.created_at),
    updated_at: asNullableString(row.updated_at),
  };
};

const normalizeRelease = (raw: unknown): PaasRelease => {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    app_id: asString(row.app_id),
    build_id: asString(row.build_id),
    image_tag: asString(row.image_tag),
    version: asString(row.version),
    created_at: asNullableString(row.created_at),
  };
};

const normalizeDeployment = (raw: unknown): PaasDeployment => {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    app_id: asString(row.app_id),
    release_id: asString(row.release_id),
    platform_workload_id: asString(row.platform_workload_id),
    cluster_id: asString(row.cluster_id),
    namespace: asString(row.namespace),
    domain: asString(row.domain),
    status: asString(row.status),
    created_at: asNullableString(row.created_at),
  };
};

const normalizeStatus = (raw: unknown): PaasAppStatus => {
  const row = asRecord(raw);
  const platform = row.platform;
  return {
    app_id: asString(row.app_id),
    deployment_id: asString(row.deployment_id),
    release_id: asString(row.release_id),
    platform_workload_id: asString(row.platform_workload_id),
    status: asString(row.status),
    platform:
      platform && typeof platform === "object"
        ? (platform as { phase?: string; [key: string]: unknown })
        : undefined,
  };
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

export async function listPaasApps(ownerID: string): Promise<PaasApp[]> {
  const payload = await httpRequest<Envelope<{ items?: unknown[] }> | unknown>(
    "/paas/apps",
    { method: "GET" },
    { owner_id: ownerID },
  );
  const data = unwrapData<{ items?: unknown[] } | unknown[]>(payload);
  const items = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data).items)
      ? (asRecord(data).items as unknown[])
      : [];
  return items.map(normalizeApp).filter((item) => item.id.length > 0);
}

export async function createPaasApp(payload: {
  name: string;
  owner_id: string;
  git_repository: string;
  default_branch: string;
  runtime: string;
}): Promise<PaasApp> {
  const data = await httpRequest<Envelope<unknown>>("/paas/apps", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeApp(unwrapData<unknown>(data));
}

export async function triggerPaasBuild(appID: string): Promise<PaasBuild> {
  const data = await httpRequest<Envelope<unknown>>(`/paas/apps/${appID}/builds`, {
    method: "POST",
  });
  return normalizeBuild(unwrapData<unknown>(data));
}

export async function listPaasBuilds(appID: string): Promise<PaasBuild[]> {
  const payload = await httpRequest<Envelope<{ items?: unknown[] }> | unknown>(
    `/paas/apps/${appID}/builds`,
    { method: "GET" },
  );
  const data = unwrapData<{ items?: unknown[] } | unknown[]>(payload);
  const items = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data).items)
      ? (asRecord(data).items as unknown[])
      : [];
  return items.map(normalizeBuild).filter((item) => item.id.length > 0);
}

export async function createPaasRelease(buildID: string): Promise<PaasRelease> {
  const data = await httpRequest<Envelope<unknown>>(
    `/paas/builds/${buildID}/release`,
    { method: "POST" },
  );
  return normalizeRelease(unwrapData<unknown>(data));
}

export async function deployPaasRelease(
  releaseID: string,
  payload: { domain: string },
): Promise<PaasDeployment> {
  const data = await httpRequest<Envelope<unknown>>(
    `/paas/releases/${releaseID}/deploy`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return normalizeDeployment(unwrapData<unknown>(data));
}

export async function getPaasAppStatus(appID: string): Promise<PaasAppStatus> {
  const data = await httpRequest<Envelope<unknown>>(`/paas/apps/${appID}/status`, {
    method: "GET",
  });
  return normalizeStatus(unwrapData<unknown>(data));
}

const apiPaas = {
  request: httpRequest,
};

export default apiPaas;
