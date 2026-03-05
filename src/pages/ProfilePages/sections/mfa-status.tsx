import { useState } from "react";
import { toast } from "sonner";

import { getErrorMessage, post } from "@/lib/api/api-ums";
import { MfaSetupDialog } from "./mfa-setup-dialog";

type MfaStatusProps = {
  methods: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAdd?: () => void;
};

const labelMap: Record<string, string> = {
  authenticator: "Authenticator app",
  totp: "Authenticator app",
  sms: "SMS code",
  email: "Email code",
  recovery: "Recovery codes",
};

export function MfaStatus({
  methods,
  isLoading,
  onRefresh,
  onAdd,
}: MfaStatusProps) {
  const [busyMethod, setBusyMethod] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const items = methods.map((method) => ({
    key: method,
    label: labelMap[method] ?? method,
  }));

  const handleDisable = async (method: string) => {
    if (busyMethod) return;
    if (method !== "authenticator" && method !== "totp") {
      toast.info("This method cannot be disabled yet.");
      return;
    }
    try {
      setBusyMethod(method);
      await post("/auth/mfa/2fa/disable", {});
      toast.success("MFA method disabled");
      onRefresh?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to disable method"));
    } finally {
      setBusyMethod(null);
    }
  };

  const handleAdd = async () => {
    if (onAdd) {
      onAdd();
      return;
    }
    setSetupOpen(true);
  };

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <MfaSetupDialog
        open={setupOpen}
        onOpenChange={setSetupOpen}
        enabledMethods={methods}
        onCompleted={() => {
          setSetupOpen(false);
          onRefresh?.();
        }}
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            MFA status
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Methods enabled for your account
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {isLoading ? "Loading..." : `${items.length} enabled`}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-full border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-400/40 dark:text-indigo-200 dark:hover:bg-indigo-500/10"
          >
            Add method
          </button>
        </div>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-9 w-full rounded-lg bg-slate-100 dark:bg-white/10" />
            <div className="h-9 w-full rounded-lg bg-slate-100 dark:bg-white/10" />
          </div>
        ) : items.length ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-50/60 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              >
                <span>{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-wide text-emerald-600/80 dark:text-emerald-200/70">
                    Enabled
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDisable(item.key)}
                    disabled={busyMethod !== null}
                    className="rounded-full border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-400/40 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
                  >
                    {busyMethod === item.key ? "Disabling..." : "Disable"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No MFA methods enabled yet.
          </p>
        )}
      </div>
    </section>
  );
}
