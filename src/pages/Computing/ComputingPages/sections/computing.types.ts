import type { VmStatus } from "@/lib/api/api-vm";

export type VmRow = {
  id: string;
  name: string;
  status: VmStatus;
  region: string;
  image: string;
  flavor: string;
  public_ip: string;
  private_ip: string;
  cpu: number;
  memory_gb: number;
  disk_gb: number;
  created_at: string;
};

export const statusBadgeStyles: Record<VmStatus, string> = {
  running:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  stopped:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200",
  provisioning:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  error: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
};
