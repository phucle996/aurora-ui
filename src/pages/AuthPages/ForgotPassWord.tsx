import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthLayout, leftBackgrounds } from "./Authlayout";
import { getErrorMessage, post } from "@/lib/api/api-ums";
import { toast } from "sonner";

export default function ForgotPassWordPage() {
  const { t } = useTranslation("auth");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-300" : "text-slate-600";
  const textLabel = isDark ? "text-slate-200" : "text-slate-700";

  const canSubmit = email.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    toast.dismiss();

    try {
      await post("/auth/forgot-password", { email: email.trim() });
      toast.success(t("forgot.success"));
    } catch (err) {
      toast.error(getErrorMessage(err, t("forgot.failed")));
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
                  {t("forgot.title")}
                </h1>
                <p className={`text-sm leading-relaxed ${textMuted}`}>
                  {t("forgot.subtitle")}
                </p>
              </header>

              <div className="auth-anim auth-anim-delay-2">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="forgot-email" className={textLabel}>
                        {t("forgot.emailLabel")}
                      </FieldLabel>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder={t("forgot.emailPlaceholder")}
                        className="h-12 text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Field>

                    <Field>
                      <Button
                        type="submit"
                        disabled={!canSubmit || submitting}
                        className="w-full bg-indigo-500 text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting
                          ? t("forgot.submitting")
                          : t("forgot.submit")}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </div>
            </div>

            <div className={`text-sm ${textMuted} auth-anim auth-anim-delay-3`}>
              <Link className="text-primary hover:underline" to="/login">
                {t("forgot.backToLogin")}
              </Link>
            </div>
          </div>
        </div>

        <AuthLayout />
      </div>
    </div>
  );
}
