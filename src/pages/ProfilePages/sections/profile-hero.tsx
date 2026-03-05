import { ShieldCheck, UserCircle2 } from "lucide-react";

type ProfileHeroProps = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  status?: string | null;
  onBoarding?: boolean | null;
};

const statusTone: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  disabled:
    "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

export function ProfileHero({
  name,
  email,
  avatarUrl,
  status,
  onBoarding,
}: ProfileHeroProps) {
  const normalizedStatus = status?.toLowerCase?.() ?? "";
  const statusClass =
    statusTone[normalizedStatus] ??
    "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-500 dark:text-slate-300">
              <UserCircle2 className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="min-w-[220px] flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {name || "Unnamed user"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
            {normalizedStatus || "unknown"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            {onBoarding ? "Onboarded" : "Onboarding"}
          </span>
        </div>
      </div>
    </section>
  );
}
