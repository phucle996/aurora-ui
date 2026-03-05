import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Lock,
  Server,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import OnboardingPage from "@/pages/Onboarding/Onboarding";
import api from "@/lib/api/api-ums";

const metrics = [
  { label: "Total Users", value: "128,430", trend: "+6.4%" },
  { label: "Active Sessions", value: "4,982", trend: "+2.1%" },
  { label: "Active Tenants", value: "812", trend: "+1.7%" },
  { label: "Failed Login Attempts", value: "143", trend: "-12.3%" },
  { label: "MFA Enabled Rate", value: "78%", trend: "+4.9%" },
];

const activityItems = [
  { icon: Users, text: "User logged in from new device", time: "2m ago" },
  {
    icon: Lock,
    text: "Account locked after 5 failed attempts",
    time: "12m ago",
  },
  { icon: KeyRound, text: "Token revoked for API key 2f4a", time: "28m ago" },
  { icon: UserPlus, text: "New tenant created: Northwind", time: "1h ago" },
  { icon: ShieldCheck, text: "MFA enabled for 32 users", time: "3h ago" },
];

const resources = [
  { name: "Okta SSO", status: "active" },
  { name: "Google Workspace", status: "active" },
  { name: "SMTP Relay", status: "warning" },
  { name: "OAuth Clients", status: "active" },
  { name: "API Keys", status: "error" },
];

const statusStyles: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  error: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

type MeResponse = {
  data?: {
    on_boarding?: boolean;
  };
  on_boarding?: boolean;
};

export default function DashboardPage() {
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get<MeResponse>("/auth/me");
      return res.data;
    },
  });

  const onboardingRequired = useMemo(() => {
    const value = data?.data?.on_boarding ?? data?.on_boarding;
    return value === false;
  }, [data]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <section className="grid gap-4 md:grid-cols-12">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="col-span-12 flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur md:col-span-6 xl:col-span-2 dark:border-white/10 dark:bg-slate-950/60"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                {metric.value}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                {metric.trend}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-1.5 w-2/3 rounded-full bg-purple-500/80" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="col-span-12 rounded-xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur lg:col-span-7 dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Authentication Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rolling 30-day login volume
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Last 30 days
            </span>
          </div>
          <div className="mt-4 h-40 rounded-lg bg-gradient-to-b from-purple-50/70 via-white/80 to-white/90 dark:from-slate-900/70 dark:via-slate-950/60 dark:to-slate-950/40">
            <div className="flex h-full items-end gap-2 px-2 pb-3">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t-md bg-purple-500/60"
                  style={{ height: `${35 + idx * 3}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 rounded-xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur lg:col-span-5 dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                MFA Adoption
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Percentage of active users
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              This week
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 rounded-full border-8 border-slate-100 dark:border-white/10" />
              <div className="absolute inset-0 rounded-full border-8 border-purple-500 border-t-transparent border-l-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-slate-900 dark:text-white">
                78%
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Enabled</span>
            <span>22% remaining</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="col-span-12 rounded-xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur lg:col-span-7 dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Activity & Events
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest security and system events
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Live
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {activityItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                  <item.icon className="h-4 w-4 text-purple-500" />
                  <span>{item.text}</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 rounded-xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur lg:col-span-5 dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Config Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Critical integrations and services
              </p>
            </div>
            <Server className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="mt-4 space-y-3">
            {resources.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.status === "active" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : item.status === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-rose-500" />
                  )}
                  <span>{item.name}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {onboardingRequired && !onboardingDismissed && (
        <OnboardingPage
          variant="overlay"
          onSkip={() => setOnboardingDismissed(true)}
          onComplete={() => setOnboardingDismissed(true)}
        />
      )}
    </div>
  );
}
