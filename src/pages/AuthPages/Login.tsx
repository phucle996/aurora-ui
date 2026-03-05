import { useEffect, useState } from "react";
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

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-300" : "text-slate-600";
  const textLabel = isDark ? "text-slate-200" : "text-slate-700";

  const canSubmit = username.trim().length > 0 && password.length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    toast.dismiss();

    try {
      const { data } = await post<{
        message?: string;
        data?: {
          mfa_required?: boolean;
          methods?: string[];
          mfa_session?: string;
          mfa_session_ttl_seconds?: number;
          user_id?: string;
        };
        mfa_required?: boolean;
        methods?: string[];
        mfa_session?: string;
        mfa_session_ttl_seconds?: number;
        user_id?: string;
      }>("/auth/login", {
        username: username.trim(),
        password,
      });

      const payload = data?.data ?? data;
      if (payload?.mfa_required) {
        toast.info("MFA required");
        navigate("/mfa", {
          state: {
            methods: payload?.methods ?? [],
            mfaSession: payload?.mfa_session ?? "",
            mfaSessionTTLSeconds: payload?.mfa_session_ttl_seconds ?? 0,
            userID: payload?.user_id ?? "",
          },
        });
        return;
      }

      toast.success(t("login.toastSuccess"));
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err, t("login.toastFail")));
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
                  {t("login.title")}
                </h1>
                <p className={`text-sm leading-relaxed ${textMuted}`}>
                  {t("login.subtitle")}
                </p>
              </header>

              <div className="auth-anim auth-anim-delay-2">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel
                        htmlFor="login-username"
                        className={textLabel}
                      >
                        {t("login.usernameLabel")}
                      </FieldLabel>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder={t("login.usernamePlaceholder")}
                        className="h-12 text-base"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel
                        htmlFor="login-password"
                        className={`mb-0 ${textLabel}`}
                      >
                        {t("login.passwordLabel")}
                      </FieldLabel>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t("login.passwordPlaceholder")}
                        className="h-12 text-base"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Field>

                    <div
                      className={`flex items-center justify-between gap-4 text-sm ${textMuted}`}
                    >
                      <label className="flex items-center gap-2">
                        <Checkbox id="login-remember" />
                        <span>{t("login.remember")}</span>
                      </label>
                      <Link
                        className="text-primary hover:underline"
                        to="/forgot-password"
                      >
                        {t("login.forgot")}
                      </Link>
                    </div>

                    <Field>
                      <Button
                        type="submit"
                        disabled={!canSubmit || submitting}
                        className="w-full bg-indigo-500 text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? t("login.submitting") : t("login.submit")}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </div>
            </div>

            <div className={`text-sm ${textMuted} auth-anim auth-anim-delay-3`}>
              {t("login.noAccount")}{" "}
              <Link className="text-primary hover:underline" to="/register">
                {t("login.signUpLink")}
              </Link>
            </div>
          </div>
        </div>

        <AuthLayout />
      </div>
    </div>
  );
}
