import type { VmRow } from "./computing.types";
import { statusBadgeStyles } from "./computing.types";

type Props = {
  isLoading: boolean;
  rows: VmRow[];
};

export function ComputingVmTableSection({ isLoading, rows }: Props) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
      <div className="hidden grid-cols-12 bg-slate-100/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-slate-400 md:grid">
        <span className="col-span-3">Name</span>
        <span className="col-span-2">Status</span>
        <span className="col-span-2">Region</span>
        <span className="col-span-2">Flavor</span>
        <span className="col-span-2">Public IP</span>
        <span className="col-span-1 text-right">Disk</span>
      </div>

      <div className="divide-y divide-slate-200/70 dark:divide-white/10">
        {isLoading && (
          <div className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading virtual machines...
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No VM found for current filter.
          </div>
        )}

        {rows.map((vm) => (
          <article
            key={vm.id}
            className="grid gap-3 px-3 py-3 md:grid-cols-12 md:items-center"
          >
            <div className="md:col-span-3">
              <p className="font-semibold">{vm.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{vm.id}</p>
            </div>
            <div className="md:col-span-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeStyles[vm.status]}`}
              >
                {vm.status}
              </span>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 md:col-span-2">
              {vm.region}
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 md:col-span-2">
              {vm.flavor}
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 md:col-span-2">
              {vm.public_ip}
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 md:col-span-1 md:text-right">
              {vm.disk_gb} GB
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
