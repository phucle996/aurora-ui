import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage, post } from "@/lib/api/api-ums";

type MfaSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabledMethods: string[];
  onCompleted?: () => void;
};

const labelMap: Record<string, string> = {
  authenticator: "Authenticator app",
  totp: "Authenticator app",
  sms: "SMS code",
  email: "Email code",
};

export function MfaSetupDialog({
  open,
  onOpenChange,
  enabledMethods,
  onCompleted,
}: MfaSetupDialogProps) {
  const [activeMethod, setActiveMethod] = useState<
    "authenticator" | "sms" | "email" | null
  >(null);
  const [setupSecret, setSetupSecret] = useState("");
  const [setupUrl, setSetupUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const isEnabled = (method: string) =>
    enabledMethods.includes(method) ||
    enabledMethods.includes(method === "totp" ? "authenticator" : method);

  const resetSetup = () => {
    setSetupSecret("");
    setSetupUrl("");
    setQrDataUrl("");
    setTotpCode("");
  };

  const toggleMethod = (key: "authenticator" | "sms" | "email") => {
    if (isEnabled(key)) {
      return;
    }
    setActiveMethod((prev) => (prev === key ? null : key));
  };

  const copySetupKey = async () => {
    try {
      await navigator.clipboard.writeText(setupSecret);
      toast.success("Copied setup key");
    } catch (err) {
      toast.error("Copy failed. Please copy manually.");
      return err;
    }
    return null;
  };

  const verifyTOTP = async () => {
    if (!totpCode.trim()) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    try {
      setIsVerifying(true);
      await post("/auth/mfa/totp/verify", { code: totpCode.trim() });
      toast.success("2FA enabled successfully");
      onCompleted?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to verify code"));
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setActiveMethod(null);
      resetSetup();
      return;
    }
    if (activeMethod !== "authenticator" || setupSecret || isLoadingSetup) {
      return;
    }
    const fetchSetup = async () => {
      try {
        setIsLoadingSetup(true);
        const { data } = await post<{
          data?: { secret?: string; otpauth_url?: string };
          secret?: string;
          otpauth_url?: string;
        }>("/auth/mfa/totp/setup", {});
        const payload = data?.data ?? data;
        setSetupSecret(payload?.secret ?? "");
        setSetupUrl(payload?.otpauth_url ?? "");
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to create 2FA setup"));
      } finally {
        setIsLoadingSetup(false);
      }
    };
    fetchSetup();
  }, [open, activeMethod, setupSecret, isLoadingSetup]);

  useEffect(() => {
    let mounted = true;
    if (!setupUrl) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(setupUrl, {
      width: 180,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (mounted) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (mounted) {
          setQrDataUrl("");
        }
      });
    return () => {
      mounted = false;
    };
  }, [setupUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[1400px] overflow-hidden border border-slate-200/60 bg-white/95 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
        <DialogHeader>
          <DialogTitle>Enable MFA</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {(["authenticator", "sms", "email"] as const).map((method) => {
            const label = labelMap[method] ?? method;
            const enabled = isEnabled(method);
            return (
              <div
                key={method}
                className={`rounded-xl border border-slate-200/70 px-4 py-4 text-sm transition-all dark:border-white/10 ${
                  activeMethod === method
                    ? "bg-slate-100/60 dark:bg-white/10"
                    : "bg-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleMethod(method)}
                  disabled={enabled}
                  className="flex w-full items-center justify-between gap-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="font-semibold">{label}</span>
                  {enabled ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-300">
                      ✓ Enabled
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Recommended</span>
                  )}
                </button>

                {method === "authenticator" ? (
                  <div
                    className={`space-y-4 overflow-hidden transition-[max-height,opacity,margin] duration-400 ease-in-out ${
                      activeMethod === "authenticator" && !enabled
                        ? "mt-4 max-h-[700px] opacity-100"
                        : "mt-0 max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mx-auto flex h-[260px] w-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5">
                      {setupUrl ? (
                        <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:border-white/10 dark:bg-white/10">
                          {qrDataUrl ? (
                            <img
                              src={qrDataUrl}
                              alt="Authenticator QR"
                              className="h-full w-full object-cover "
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-200/50 dark:bg-white/10" />
                          )}
                        </div>
                      ) : (
                        "QR Code"
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Setup key
                      </p>
                      <div className="mt-1 space-y-2">
                        <button
                          type="button"
                          className="w-full overflow-x-auto whitespace-nowrap rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-left text-base text-slate-700 transition hover:border-indigo-400/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:text-white"
                          onClick={copySetupKey}
                          disabled={!setupSecret}
                        >
                          {setupSecret || (isLoadingSetup ? "Loading..." : "—")}
                        </button>
                        <div className="flex justify-end"></div>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Click to copy
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <Input
                        placeholder="Enter 6-digit code"
                        className="h-12 text-base"
                        value={totpCode}
                        onChange={(event) => setTotpCode(event.target.value)}
                      />
                      <Button
                        type="button"
                        className="rounded-full bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-400"
                        onClick={verifyTOTP}
                        disabled={isVerifying}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out ${
                      activeMethod === method && !enabled
                        ? "mt-4 max-h-32 opacity-100"
                        : "mt-0 max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      This method is coming soon.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
