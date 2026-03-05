import { Cpu, HardDrive, Server } from "lucide-react";

type ComputingStats = {
  total: number;
  running: number;
  cpu: number;
  disk: number;
};

type Props = {
  stats: ComputingStats;
};

export function ComputingStatsSection({ stats }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Total VMs
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-semibold">{stats.total}</p>
          <Server className="h-4 w-4 text-indigo-400" />
        </div>
      </article>

      <article className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Running
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-semibold">{stats.running}</p>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
      </article>

      <article className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Total vCPU
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-semibold">{stats.cpu}</p>
          <Cpu className="h-4 w-4 text-violet-400" />
        </div>
      </article>

      <article className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Total Disk (GB)
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-semibold">{stats.disk}</p>
          <HardDrive className="h-4 w-4 text-sky-400" />
        </div>
      </article>
    </section>
  );
}
