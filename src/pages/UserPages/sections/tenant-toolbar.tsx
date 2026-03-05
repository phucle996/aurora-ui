import { Plus, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type TenantToolbarProps = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  onCreateClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export function TenantToolbar({
  searchText,
  onSearchTextChange,
  onCreateClick,
  onRefresh,
  isRefreshing = false,
}: TenantToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex h-10 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 sm:max-w-md dark:border-white/10 dark:bg-slate-900/60">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          placeholder="Search tenant by name or domain"
          className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-10 rounded-full"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button type="button" onClick={onCreateClick} className="h-10 rounded-full">
          <Plus className="h-4 w-4" />
          New Tenant
        </Button>
      </div>
    </div>
  );
}
