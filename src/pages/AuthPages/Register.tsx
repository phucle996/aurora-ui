import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthLayout, leftBackgrounds } from "./Authlayout";
import { getErrorMessage, post } from "@/lib/api/api-ums";
import { toast } from "sonner";

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const passwordStatus = useMemo(() => {
    return {
      length: passwordRules.length(password),
      upper: passwordRules.upper(password),
      lower: passwordRules.lower(password),
      number: passwordRules.number(password),
      special: passwordRules.special(password),
    };
  }, [password]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const isPasswordValid = Object.values(passwordStatus).every(Boolean);
  const isConfirmMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const canSubmit =
    isPasswordValid &&
    isConfirmMatch &&
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    termsAccepted;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    toast.dismiss();

    try {
      await post("/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password,
        re_password: confirmPassword,
      });

      toast.success(t("register.toastSuccess"));
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      toast.error(getErrorMessage(err, t("register.toastFail")));
    } finally {
      setSubmitting(false);
    }
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-300" : "text-slate-600";
  const textLabel = isDark ? "text-slate-200" : "text-slate-700";

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
                  {t("register.title")}
                </h1>
                <p className={`text-sm leading-relaxed ${textMuted}`}>
                  {t("register.subtitle")}
                </p>
              </header>

              <div className="max-w-xl auth-anim auth-anim-delay-2">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel
                        htmlFor="register-username"
                        className={textLabel}
                      >
                        {t("register.usernameLabel")}
                      </FieldLabel>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder={t("register.usernamePlaceholder")}
                        className="h-12 text-base"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel
                        htmlFor="register-email"
                        className={textLabel}
                      >
                        {t("register.emailLabel")}
                      </FieldLabel>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t("register.emailPlaceholder")}
                        className="h-12 text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel
                        htmlFor="register-password"
                        className={textLabel}
                      >
                        {t("register.passwordLabel")}
                      </FieldLabel>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder={t("register.passwordPlaceholder")}
                        className="h-12 text-base"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />

                      {/* Password rules */}
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
                        htmlFor="register-confirm-password"
                        className={textLabel}
                      >
                        {t("register.confirmLabel")}
                      </FieldLabel>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder={t("register.confirmPlaceholder")}
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
                            ? t("register.match")
                            : t("register.mismatch")}
                        </p>
                      )}
                    </Field>

                    <div
                      className={`flex items-start gap-3 text-sm ${textMuted}`}
                    >
                      <Checkbox
                        id="register-terms"
                        className="mt-1"
                        checked={termsAccepted}
                        onCheckedChange={(value) =>
                          setTermsAccepted(value === true)
                        }
                        required
                      />
                      <label
                        htmlFor="register-terms"
                        className={`leading-relaxed ${textMuted}`}
                      >
                        {t("register.termsPrefix")}{" "}
                        <Link
                          className="font-semibold text-primary hover:underline"
                          to="/terms"
                        >
                          {t("register.termsLink")}
                        </Link>{" "}
                        {t("register.termsMiddle")}{" "}
                        <Link
                          className="font-semibold text-primary hover:underline"
                          to="/privacy"
                        >
                          {t("register.privacyLink")}
                        </Link>
                        {t("register.termsSuffix")}
                      </label>
                    </div>

                    <Field>
                      <Button
                        type="submit"
                        disabled={!canSubmit || submitting}
                        className="w-full bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting
                          ? t("register.submitting")
                          : t("register.submit")}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </div>
            </div>

            <div className={`text-sm ${textMuted} auth-anim auth-anim-delay-3`}>
              {t("register.hasAccount")}{" "}
              <Link className="text-primary hover:underline" to="/login">
                {t("register.signInLink")}
              </Link>
            </div>
          </div>
        </div>

        <AuthLayout />
      </div>
    </div>
  );
}
