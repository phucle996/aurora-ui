import { Plus, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TenantOption = {
  id: string;
  label: string;
};

type WorkspaceToolbarProps = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  tenantFilter: string;
  onTenantFilterChange: (value: string) => void;
  tenantOptions: TenantOption[];
  onCreateClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export function WorkspaceToolbar({
  searchText,
  onSearchTextChange,
  tenantFilter,
  onTenantFilterChange,
  tenantOptions,
  onCreateClick,
  onRefresh,
  isRefreshing = false,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-10 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 sm:max-w-md dark:border-white/10 dark:bg-slate-900/60">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Search workspace by name, slug, tenant, or domain"
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <Select value={tenantFilter} onValueChange={onTenantFilterChange}>
          <SelectTrigger className="h-10 w-full rounded-full border-slate-200 bg-white px-4 text-sm sm:w-[220px] dark:border-white/10 dark:bg-slate-900/60">
            <SelectValue placeholder="All tenants" />
          </SelectTrigger>
          <SelectContent align="start" className="min-w-[220px]">
            <SelectItem value="all">All tenants</SelectItem>
            {tenantOptions.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          New Workspace
        </Button>
      </div>
    </div>
  );
}
