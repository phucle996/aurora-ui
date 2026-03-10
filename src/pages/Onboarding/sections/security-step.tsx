import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api, { getErrorMessage, post } from "@/lib/api/api-ums";

export function SecurityStep() {
  const [activeMethod, setActiveMethod] = useState<
    "authenticator" | "sms" | "email" | null
  >(null);
  const [enabledMethods, setEnabledMethods] = useState<string[]>([]);
  const [setupSecret, setSetupSecret] = useState("");
  const [setupUrl, setSetupUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [setupCooldownUntil, setSetupCooldownUntil] = useState<number | null>(
    null,
  );
  const [totpCode, setTotpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const didFetchMethodsRef = useRef(false);

  const toggleMethod = (key: "authenticator" | "sms" | "email") => {
    if (enabledMethods.includes(key)) {
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
      setEnabledMethods((prev) =>
        prev.includes("authenticator") ? prev : [...prev, "authenticator"],
      );
      setActiveMethod(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to verify code"));
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (activeMethod !== "authenticator" || setupSecret || isLoadingSetup) {
      return;
    }
    if (setupCooldownUntil && Date.now() < setupCooldownUntil) {
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
        const message = getErrorMessage(err, "Failed to create 2FA setup");
        toast.error(message);
        setSetupCooldownUntil(Date.now() + 60_000);
      } finally {
        setIsLoadingSetup(false);
      }
    };
    fetchSetup();
  }, [activeMethod, setupSecret, isLoadingSetup, setupCooldownUntil]);

  useEffect(() => {
    if (didFetchMethodsRef.current) {
      return;
    }
    didFetchMethodsRef.current = true;
    let mounted = true;
    const fetchMethods = async () => {
      try {
        // load enabled methods
        const { data } = await api.get<{
          data?: { methods?: string[] };
          methods?: string[];
        }>("/auth/mfa/methods");
        const payload = data?.data ?? data;
        const rawMethods = payload?.methods ?? [];
        const methods = rawMethods.map((item) =>
          item === "totp" ? "authenticator" : item,
        );
        if (mounted) {
          setEnabledMethods(methods);
          if (methods.length > 0 && activeMethod) {
            setActiveMethod(null);
          }
        }
      } catch (err) {
        if (mounted) {
          toast.error(getErrorMessage(err, "Failed to load MFA methods"));
        }
      } finally {
        // no-op
      }
    };
    fetchMethods();
    return () => {
      mounted = false;
    };
  }, [activeMethod]);

  useEffect(() => {
    let mounted = true;
    if (!setupUrl) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(setupUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
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
    <div className="mt-6 space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Choose 2FA methods</FieldLabel>

          <div className="space-y-4">
            <div
              className={`rounded-xl border border-white/10 px-4 py-4 text-sm transition-all ${
                activeMethod === "authenticator" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleMethod("authenticator")}
                disabled={enabledMethods.includes("authenticator")}
                className="flex w-full items-center justify-between gap-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-white">
                    Authenticator app
                  </span>
                </span>
                {enabledMethods.includes("authenticator") ? (
                  <span className="text-xs text-emerald-300">✓ Enabled</span>
                ) : (
                  <span className="text-xs text-slate-400">Recommended</span>
                )}
              </button>

              <div
                className={`grid items-start gap-6 overflow-hidden transition-[max-height,opacity,margin] duration-400 ease-in-out sm:grid-cols-[280px_1fr] ${
                  activeMethod === "authenticator" &&
                  !enabledMethods.includes("authenticator")
                    ? "mt-4 max-h-[620px] opacity-100"
                    : "mt-0 max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex h-72 w-72 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-center text-xs text-slate-300">
                    {setupUrl ? (
                      <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Authenticator QR"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-white/20" />
                        )}
                      </div>
                    ) : (
                      "QR Code"
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/70">
                      Setup key
                    </p>
                    <button
                      type="button"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-left text-xl text-slate-200 transition hover:border-indigo-400/60 hover:text-white"
                      onClick={copySetupKey}
                      disabled={!setupSecret}
                    >
                      {setupSecret || (isLoadingSetup ? "Loading..." : "—")}
                    </button>
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
              </div>
            </div>

            <div
              className={`rounded-xl border border-white/10 px-4 py-4 text-sm transition-all ${
                activeMethod === "sms" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleMethod("sms")}
                disabled={enabledMethods.includes("sms")}
                className="flex w-full items-center justify-between gap-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-white">SMS code</span>
                </span>
                {enabledMethods.includes("sms") ? (
                  <span className="text-xs text-emerald-300">✓ Enabled</span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Phone verification
                  </span>
                )}
              </button>

              <div
                className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out ${
                  activeMethod === "sms" && !enabledMethods.includes("sms")
                    ? "mt-4 max-h-40 opacity-100"
                    : "mt-0 max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-3">
                  <Input placeholder="Enter phone number" className="h-11" />
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <Input placeholder="Enter SMS code" className="h-11" />
                    <Button className="rounded-full bg-indigo-500 px-5 text-white hover:bg-indigo-400">
                      Verify
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-xl border border-white/10 px-4 py-4 text-sm transition-all ${
                activeMethod === "email" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleMethod("email")}
                disabled={enabledMethods.includes("email")}
                className="flex w-full items-center justify-between gap-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-white">Email code</span>
                </span>
                {enabledMethods.includes("email") ? (
                  <span className="text-xs text-emerald-300">✓ Enabled</span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Email verification
                  </span>
                )}
              </button>

              <div
                className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out ${
                  activeMethod === "email" && !enabledMethods.includes("email")
                    ? "mt-4 max-h-40 opacity-100"
                    : "mt-0 max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-3">
                  <Input placeholder="Enter email address" className="h-11" />
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <Input placeholder="Enter email code" className="h-11" />
                    <Button className="rounded-full bg-indigo-500 px-5 text-white hover:bg-indigo-400">
                      Verify
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Field>
      </FieldGroup>
    </div>
  );
}
