import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthLayout, leftBackgrounds } from "./Authlayout";
import { getErrorMessage, post } from "@/lib/api/api-ums";
import { toast } from "sonner";

type VerifyState = "idle" | "verifying" | "valid" | "invalid";

const passwordRules = {
  length: (v: string) => v.length >= 8,
  upper: (v: string) => /[A-Z]/.test(v),
  lower: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /[0-9]/.test(v),
  special: (v: string) => /[^A-Za-z0-9]/.test(v),
};

function PasswordRule({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`flex items-center gap-2 ${
        ok ? "text-emerald-400" : "text-slate-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          ok ? "bg-emerald-400" : "bg-slate-500"
        }`}
      />
      {children}
    </li>
  );
}

const requestedKeys = new Set<string>();

export default function NewPasswordPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { userid, token } = useParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!userid || !token) {
        setVerifyState("invalid");
        setErrorMessage("");
        return;
      }

      const key = `${userid}:${token}`;
      if (requestedKeys.has(key)) return;
      requestedKeys.add(key);

      setVerifyState("verifying");
      setErrorMessage("");
      toast.dismiss();

      try {
        await post("/auth/reset-password/verify", {
          user_id: userid,
          token,
        });
        setVerifyState("valid");
        setErrorMessage("");
      } catch (err) {
        const msg = getErrorMessage(err, t("newPassword.verifyFailed"));
        setVerifyState("invalid");
        setErrorMessage(msg);
        toast.error(msg);
      }
    };

    void run();
  }, [userid, token, t]);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-300" : "text-slate-600";
  const textLabel = isDark ? "text-slate-200" : "text-slate-700";

  const passwordStatus = useMemo(
    () => ({
      length: passwordRules.length(password),
      upper: passwordRules.upper(password),
      lower: passwordRules.lower(password),
      number: passwordRules.number(password),
      special: passwordRules.special(password),
    }),
    [password],
  );

  const isPasswordValid = Object.values(passwordStatus).every(Boolean);
  const isConfirmMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  const canSubmit =
    verifyState === "valid" && isPasswordValid && isConfirmMatch;

  const verifyMessage =
    verifyState === "valid"
      ? t("newPassword.verified")
      : verifyState === "verifying"
        ? t("newPassword.verifying")
        : verifyState === "invalid"
          ? errorMessage || t("newPassword.verifyFailed")
          : "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitting || !userid || !token) return;

    setSubmitting(true);
    toast.dismiss();

    try {
      await post("/auth/new-password", {
        user_id: userid,
        token,
        password,
        re_password: confirmPassword,
      });
      toast.success(t("newPassword.success"));
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      toast.error(getErrorMessage(err, t("newPassword.failed")));
    } finally {
      setSubmitting(false);
    }
  };

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
                  {t("sectionLabel")}
                </p>
                <h1 className={`text-3xl font-semibold ${textPrimary}`}>
                  {t("newPassword.title")}
                </h1>
                <p className={`text-sm leading-relaxed ${textMuted}`}>
                  {t("newPassword.subtitle")}
                </p>
              </header>

              <div className="auth-anim auth-anim-delay-2 space-y-4">
                <p className={`text-base ${textPrimary}`}>{verifyMessage}</p>

                {verifyState === "valid" && (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel
                          htmlFor="new-password"
                          className={textLabel}
                        >
                          {t("newPassword.passwordLabel")}
                        </FieldLabel>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder={t("newPassword.passwordPlaceholder")}
                          className="h-12 text-base"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <ul className={`mt-3 space-y-1 text-sm ${textMuted}`}>
                          <PasswordRule ok={passwordStatus.length}>
                            {t("register.rules.length")}
                          </PasswordRule>
                          <PasswordRule ok={passwordStatus.upper}>
                            {t("register.rules.upper")}
                          </PasswordRule>
                          <PasswordRule ok={passwordStatus.lower}>
                            {t("register.rules.lower")}
                          </PasswordRule>
                          <PasswordRule ok={passwordStatus.number}>
                            {t("register.rules.number")}
                          </PasswordRule>
                          <PasswordRule ok={passwordStatus.special}>
                            {t("register.rules.special")}
                          </PasswordRule>
                        </ul>
                      </Field>

                      <Field>
                        <FieldLabel
                          htmlFor="new-password-confirm"
                          className={textLabel}
                        >
                          {t("newPassword.confirmLabel")}
                        </FieldLabel>
                        <Input
                          id="new-password-confirm"
                          type="password"
                          placeholder={t("newPassword.confirmPlaceholder")}
                          className="h-12 text-base"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        {confirmPassword.length > 0 && (
                          <p
                            className={`mt-2 text-xs ${
                              isConfirmMatch
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {isConfirmMatch
                              ? t("newPassword.match")
                              : t("newPassword.mismatch")}
                          </p>
                        )}
                      </Field>

                      <Field>
                        <Button
                          type="submit"
                          disabled={!canSubmit || submitting}
                          className="w-full bg-indigo-500 text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting
                            ? t("newPassword.submitting")
                            : t("newPassword.submit")}
                        </Button>
                      </Field>
                    </FieldGroup>
                  </form>
                )}
              </div>
            </div>

            <div className={`text-sm ${textMuted} auth-anim auth-anim-delay-3`}>
              <Link className="text-primary hover:underline" to="/login">
                {t("newPassword.backToLogin")}
              </Link>
            </div>
          </div>
        </div>

        <AuthLayout />
      </div>
    </div>
  );
}
