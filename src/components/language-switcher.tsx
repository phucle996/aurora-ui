import { useTranslation } from "react-i18next";
import { languages } from "@/i18n/types";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");
  const current = (i18n.language || "en").split("-")[0];
  const currentLabel =
    languages.find((lang) => lang.code === current)?.label ?? "EN";

  return (
    <div
      className="group inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-black/5 shadow-lg backdrop-blur transition-all duration-300 hover:w-64 dark:border-white/10 dark:bg-white/5"
      aria-label={t("language.label")}
    >
      <div className="flex w-full items-center justify-center gap-1 px-1 transition-all duration-200 group-hover:justify-between">
        <div className="pointer-events-none flex min-w-0 max-w-0 flex-1 items-center justify-start gap-1 overflow-hidden opacity-0 transition-[max-width,opacity] duration-200 group-hover:pointer-events-auto group-hover:max-w-[220px] group-hover:opacity-100">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => i18n.changeLanguage(lang.code)}
              title={t(`language.names.${lang.code}`)}
              aria-label={t(`language.names.${lang.code}`)}
              className={`grid h-9 w-9 place-items-center rounded-full text-[11px] font-semibold transition ${
                current === lang.code
                  ? "bg-black/10 text-slate-900 dark:bg-white/20 dark:text-white"
                  : "text-slate-600 hover:bg-black/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent text-[11px] font-semibold leading-none text-slate-900 transition group-hover:bg-black/5 hover:bg-black/10 dark:text-white dark:group-hover:bg-white/10 dark:hover:bg-white/15"
          title={t("language.label")}
          aria-label={t("language.label")}
        >
          {currentLabel}
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
