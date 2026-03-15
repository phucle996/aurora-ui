declare global {
  interface Window {
    __AURORA_RUNTIME__?: Record<string, string | undefined>;
  }
}

const viteRuntime = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

export function runtimeEnv(key: string, fallback = ""): string {
  const runtimeValue = window.__AURORA_RUNTIME__?.[key];
  if (typeof runtimeValue === "string" && runtimeValue.trim() !== "") {
    return runtimeValue.trim();
  }
  const viteValue = viteRuntime?.[key];
  if (typeof viteValue === "string" && viteValue.trim() !== "") {
    return viteValue.trim();
  }
  return fallback;
}
