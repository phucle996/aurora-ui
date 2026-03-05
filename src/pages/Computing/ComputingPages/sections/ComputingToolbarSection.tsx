import { RefreshCw, Search } from "lucide-react";
import type { VmStatus } from "@/lib/api/api-vm";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  statusFilter: "all" | VmStatus;
  onStatusFilterChange: (value: "all" | VmStatus) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function ComputingToolbarSection({
  searchText,
  onSearchTextChange,
  statusFilter,
  onStatusFilterChange,
  isRefreshing,
  onRefresh,
}: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-10 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 sm:max-w-md dark:border-white/10 dark:bg-slate-900/60">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Search VM by name, region, image, or IP"
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as "all" | VmStatus)}
        >
          <SelectTrigger className="h-10 w-full rounded-full border-slate-200 bg-white px-4 text-sm sm:w-[180px] dark:border-white/10 dark:bg-slate-900/60">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent align="start" className="min-w-[180px]">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="stopped">Stopped</SelectItem>
            <SelectItem value="provisioning">Provisioning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/10"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
}
