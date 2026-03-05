import { Clock3, History, RefreshCw, Rocket, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const changelog = [
  {
    version: "v1.24.0",
    date: "Feb 06, 2026",
    type: "Feature",
    notes: "Added MFA challenge flow and adaptive device validation.",
  },
  {
    version: "v1.23.6",
    date: "Jan 31, 2026",
    type: "Security",
    notes: "Patched refresh-token replay edge case for inactive devices.",
  },
  {
    version: "v1.23.2",
    date: "Jan 24, 2026",
    type: "Fix",
    notes: "Improved profile upsert consistency and onboarding state sync.",
  },
];

export function UpdatesChangelogSection() {
  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <Card className="border-slate-200/70 bg-white/80 shadow-none backdrop-blur xl:col-span-5 dark:border-white/10 dark:bg-slate-950/60">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-4 w-4 text-indigo-500" />
            Update channel
          </CardTitle>
          <CardDescription>
            Control release cadence and deployment windows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200/80 p-3 dark:border-white/10">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Current version
            </p>
            <p className="mt-1 text-xl font-semibold">v1.24.0</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Stable channel • last checked 10 minutes ago
            </p>
          </div>
          <div className="rounded-lg border border-slate-200/80 p-3 dark:border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Auto update security patches</p>
              <Badge className="bg-emerald-600 text-white">Enabled</Badge>
            </div>
            <Separator className="my-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Critical fixes are applied automatically during maintenance windows.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" className="bg-indigo-500 hover:bg-indigo-400">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check updates
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-300/80 dark:border-white/15"
            >
              Release policy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80 shadow-none backdrop-blur xl:col-span-7 dark:border-white/10 dark:bg-slate-950/60">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-cyan-500" />
            Changelog
          </CardTitle>
          <CardDescription>
            Recent updates, fixes, and security improvements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {changelog.map((item) => (
            <div
              key={item.version}
              className="rounded-lg border border-slate-200/80 p-3 dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.version}</span>
                  <Badge variant="secondary">{item.type}</Badge>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {item.date}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {item.notes}
              </p>
            </div>
          ))}

          <div className="rounded-lg border border-slate-200/80 p-3 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock3 className="h-4 w-4 text-amber-500" />
              Next maintenance window
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Sunday, 02:00-03:00 UTC
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Services remain available with rolling restarts.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Security patches are included in this window.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
