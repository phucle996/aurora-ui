import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/theme-switcher";
import LanguageSwitcher from "@/components/language-switcher";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const background = isDark
    ? "linear-gradient(160deg, #070b1f 0%, #0a122c 45%, #05060e 100%)"
    : "linear-gradient(150deg, #f2f4fb 0%, #f5f1f7 40%, #f6eaef 75%, #f7e6da 100%)";

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-300" : "text-slate-600";
  const accentText = isDark ? "text-indigo-200" : "text-indigo-600";

  return (
    <div className="min-h-screen w-full px-6 py-10 text-white">
      <div
        className="absolute inset-0 -z-10 transition-[background] duration-700 ease-out"
        style={{
          background,
        }}
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -right-24 top-16 h-64 w-64 rounded-full bg-indigo-500/18 blur-3xl" />
          <div className="absolute -left-24 bottom-10 h-56 w-56 rounded-full bg-purple-500/16 blur-3xl" />
        </div>

        <div className="relative grid w-full gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div className="space-y-5">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.3em]",
                isDark ? "text-indigo-200/70" : "text-indigo-500/70",
              )}
            >
              {t("notFound.eyebrow")}
            </p>
            <h1
              className={cn(
                "text-4xl font-semibold tracking-tight md:text-5xl",
                textPrimary,
              )}
            >
              404{" "}
              <span className={accentText}>{t("notFound.titleAccent")}</span>
            </h1>
            <p className={cn("max-w-md text-sm", textMuted)}>
              {t("notFound.description")}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="rounded-full bg-indigo-500 px-5 text-white hover:bg-indigo-400">
                <Link to="/dashboard">{t("notFound.backHome")}</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto h-100 w-100 md:h-[33rem] md:w-[33rem]">
            <img
              src={isDark ? "/404Error-dark.svg" : "/404Error-light.svg"}
              alt="404 Illustration"
              className="h-full w-full object-contain drop-shadow-[0_20px_50px_rgba(15,23,42,0.25)]"
            />
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <LanguageSwitcher />
        <div
          className={cn(
            "rounded-full border p-1.5 text-slate-900 shadow-lg backdrop-blur transition hover:bg-black/10",
            isDark
              ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
              : "border-black/10 bg-black/5",
          )}
        >
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
