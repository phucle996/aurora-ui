import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthLayout, leftBackgrounds } from "./Authlayout";
import { getErrorMessage, post } from "@/lib/api/api-ums";

type MFAMethod = "totp" | "sms" | "email" | "recovery";
type MFAState = {
  methods?: string[];
  mfaSession?: string;
  mfaSessionTTLSeconds?: number;
  userID?: string;
};

const methodMeta: Record<
  MFAMethod,
  { label: string; helper: string; badge?: string }
> = {
  totp: {
    label: "Authenticator app",
    helper: "Use the 6-digit code from your authenticator app.",
    badge: "Recommended",
  },
  sms: {
    label: "SMS code",
    helper: "We’ll text a 6-digit code to your phone.",
  },
  email: {
    label: "Email code",
    helper: "We’ll email a 6-digit code to your inbox.",
  },
  recovery: {
    label: "Recovery code",
    helper: "Use one of your backup recovery codes.",
  },
};

export default function MfaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState<MFAMethod>("totp");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const lastSubmitted = useRef("");
  const expiredHandled = useRef(false);
  const mfaState = location.state as MFAState | null;
  const hasMFASession = Boolean(mfaState?.mfaSession);
  const [ttlSeconds, setTtlSeconds] = useState(() => {
    if (
      typeof mfaState?.mfaSessionTTLSeconds === "number" &&
      mfaState.mfaSessionTTLSeconds > 0
    ) {
      return Math.floor(mfaState.mfaSessionTTLSeconds);
    }
    return 300;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-300" : "text-slate-600";
  const textLabel = isDark ? "text-slate-200" : "text-slate-700";

  const availableMethods = useMemo(() => {
    const incoming = mfaState?.methods;
    const normalized = Array.isArray(incoming)
      ? incoming.map((item) => item.toLowerCase())
      : null;
    if (!normalized || normalized.length === 0) {
      return ["totp", "sms", "email", "recovery"] as MFAMethod[];
    }
    return (Object.keys(methodMeta) as MFAMethod[]).filter(
      (key) => normalized.includes(key) || key === "recovery",
    );
  }, [mfaState?.methods]);

  useEffect(() => {
    if (!hasMFASession) {
      navigate("/login", { replace: true });
    }
  }, [hasMFASession, navigate]);

  useEffect(() => {
    if (!availableMethods.includes(method)) {
      setMethod(availableMethods[0] ?? "totp");
    }
  }, [availableMethods, method]);

  useEffect(() => {
    if (!hasMFASession) return;
    if (ttlSeconds <= 0) {
      if (expiredHandled.current) return;
      expiredHandled.current = true;
      setCode("");
      lastSubmitted.current = "";
      toast.error("MFA session expired. Please sign in again.");
      navigate("/login", { replace: true });
      return;
    }

    const timer = window.setInterval(() => {
      setTtlSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasMFASession, navigate, ttlSeconds]);

  const ttlLabel = useMemo(() => {
    const minutes = Math.floor(ttlSeconds / 60);
    const seconds = ttlSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [ttlSeconds]);

  const handleVerify = useCallback(
    async (otp = code) => {
      if (otp.length !== 6 || submitting) return;
      if (otp === lastSubmitted.current) return;
      lastSubmitted.current = otp;
      setSubmitting(true);
      toast.dismiss();

      try {
        await post("/auth/mfa/challenge/verify", {
          user_id: mfaState?.userID ?? "",
          mfa_session: mfaState?.mfaSession ?? "",
          method,
          code: otp,
        });
        toast.success("MFA verified successfully.");
        navigate("/dashboard");
      } catch (err) {
        toast.error(getErrorMessage(err, "Invalid code. Please try again."));
        setCode("");
      } finally {
        setSubmitting(false);
      }
    },
    [
      code,
      method,
      mfaState?.mfaSession,
      mfaState?.userID,
      navigate,
      submitting,
    ],
  );

  useEffect(() => {
    if (code.length === 6) {
      void handleVerify(code);
    }
  }, [code, handleVerify]);

  if (!hasMFASession) {
    return null;
  }

  return (
    <div className="min-h-screen w-full">
      <div className="grid min-h-screen w-full overflow-hidden shadow-2xl lg:grid-cols-[1.05fr_1fr]">
        <div className="relative">
          <div
            className="absolute inset-0 transition-[background] duration-500 ease-out"
            style={{
              background: isDark ? leftBackgrounds.dark : leftBackgrounds.light,
            }}
          />
          <div className="relative z-10 flex flex-col gap-10 px-6 py-20 md:px-10 lg:px-16 xl:px-24 w-full max-w-3xl mx-auto">
            <div className="space-y-6">
              <header className="space-y-2 auth-anim auth-anim-delay-1">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.14em] ${textMuted}`}
                >
                  Multi-factor authentication
                </p>
                <h1 className={`text-3xl font-semibold ${textPrimary}`}>
                  Verify your identity
                </h1>
                <p className={`text-sm leading-relaxed ${textMuted}`}>
                  Choose a verification method and enter the 6-digit code to
                  continue.
                </p>
                <p className={`text-xs font-medium ${textMuted}`}>
                  Session expires in{" "}
                  <span
                    className={isDark ? "text-amber-300" : "text-amber-700"}
                  >
                    {ttlLabel}
                  </span>
                </p>
              </header>

              <div className="space-y-6 auth-anim auth-anim-delay-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel className={textLabel}>
                      Choose a method
                    </FieldLabel>
                    <div className="flex flex-wrap gap-3">
                      {availableMethods.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setMethod(key);
                            setCode("");
                            lastSubmitted.current = "";
                          }}
                          className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                            method === key
                              ? "border-indigo-400/60 bg-indigo-500/15 text-indigo-100"
                              : isDark
                                ? "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"
                                : "border-black/10 bg-black/5 text-slate-700 hover:border-black/30"
                          }`}
                        >
                          <span>{methodMeta[key].label}</span>
                          {methodMeta[key].badge && (
                            <span className="rounded-full bg-indigo-500/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                              {methodMeta[key].badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className={`mt-3 text-xs ${textMuted}`}>
                      {methodMeta[method].helper}
                    </p>
                  </Field>

                  <Field>
                    <FieldLabel className={textLabel}>
                      Enter 6-digit code
                    </FieldLabel>
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={(value) => {
                        const sanitized = value.replace(/\D/g, "");
                        setCode(sanitized.slice(0, 6));
                      }}
                      pattern={REGEXP_ONLY_DIGITS}
                      inputMode="numeric"
                      autoFocus
                      className="gap-3"
                    >
                      <InputOTPGroup className="gap-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={`h-12 w-12 rounded-xl text-base ${
                              isDark
                                ? "border-white/10 bg-white/5 text-white"
                                : "border-black/10 bg-white text-slate-900"
                            }`}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    <p className={`mt-2 text-xs ${textMuted}`}>
                      Code will be submitted automatically after 6 digits.
                    </p>
                  </Field>

                  <Field>
                    <Button
                      type="button"
                      disabled={code.length !== 6 || submitting}
                      onClick={() => handleVerify(code)}
                      className="w-full bg-indigo-500 text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Verifying..." : "Verify code"}
                    </Button>
                  </Field>
                </FieldGroup>
              </div>
            </div>

            <div className={`text-sm ${textMuted} auth-anim auth-anim-delay-3`}>
              Having trouble?{" "}
              <Link className="text-primary hover:underline" to="/login">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>

        <AuthLayout />
      </div>
    </div>
  );
}
