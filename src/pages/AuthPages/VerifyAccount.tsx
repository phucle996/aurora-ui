import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { AuthLayout, leftBackgrounds } from "./Authlayout";
import { getErrorMessage, post } from "@/lib/api/api-ums";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type VerifyStatus = "idle" | "activating" | "success" | "already" | "fail";

const requestedKeys = new Set<string>();

export default function VerifyAccountPage() {
  const { t } = useTranslation("auth");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState("");
  const { userid, token } = useParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!userid || !token) {
        setStatus("fail");
        setMessage(t("verify.invalidLink"));
        return;
      }

      const requestKey = `${userid}:${token}`;
      if (requestedKeys.has(requestKey)) {
        return;
      }
      requestedKeys.add(requestKey);

      setStatus("activating");
      setMessage(t("verify.activating"));
      toast.dismiss();

      try {
        await post("/auth/active", {
          user_id: userid,
          token,
        });
        setStatus("success");
        setMessage(t("verify.success"));
        toast.success(t("verify.success"));
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          setStatus("already");
          setMessage(t("verify.alreadyActive"));
          toast.info(t("verify.alreadyActive"));
          return;
        }

        const msg = getErrorMessage(err, t("verify.failed"));
        setStatus("fail");
        setMessage(msg);
        toast.error(msg);
      }
    };

    void run();
  }, [userid, token, t]);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-300" : "text-slate-600";

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
          <div className="relative z-10 flex flex-col gap-6 px-6 py-24 md:px-10 lg:px-16 xl:px-24 w-full max-w-3xl mx-auto">
            <header className="space-y-2 auth-anim auth-anim-delay-1">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.14em] ${textMuted}`}
              >
                {t("sectionLabel")}
              </p>
              <h1 className={`text-3xl font-semibold ${textPrimary}`}>
                {t("verify.title")}
              </h1>
              <p className={`text-sm leading-relaxed ${textMuted}`}>
                {t("verify.subtitle")}
              </p>
            </header>

            <div className="auth-anim auth-anim-delay-2 space-y-4">
              <p className={`text-base ${textPrimary}`}>{message}</p>

              {(status === "success" || status === "already") && (
                <Button
                  asChild
                  className="bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  <Link to="/login">{t("verify.goLogin")}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <AuthLayout />
      </div>
    </div>
  );
}
