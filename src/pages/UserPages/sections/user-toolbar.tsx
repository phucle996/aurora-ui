import { Plus, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RoleOption = {
  id: string;
  label: string;
};

type UserToolbarProps = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  selectedRoleId: string;
  onSelectedRoleIdChange: (value: string) => void;
  roleOptions: RoleOption[];
  onAssignRole: () => void;
  onRefresh: () => void;
  assignDisabled?: boolean;
  isRefreshing?: boolean;
};

export function UserToolbar({
  searchText,
  onSearchTextChange,
  selectedRoleId,
  onSelectedRoleIdChange,
  roleOptions,
  onAssignRole,
  onRefresh,
  assignDisabled = false,
  isRefreshing = false,
}: UserToolbarProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
        <div className="flex h-10 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 md:max-w-md dark:border-white/10 dark:bg-slate-900/60">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Search role or permission"
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <Select value={selectedRoleId} onValueChange={onSelectedRoleIdChange}>
            <SelectTrigger className="h-10 w-full rounded-full border-slate-200 bg-white px-4 text-sm md:w-[240px] dark:border-white/10 dark:bg-slate-900/60">
              <SelectValue placeholder="Select role to assign" />
            </SelectTrigger>
            <SelectContent align="start" className="min-w-[240px]">
              {roleOptions.length === 0 ? (
                <SelectItem value="none" disabled>
                  No available role
                </SelectItem>
              ) : (
                roleOptions.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={onAssignRole}
            disabled={assignDisabled}
            className="h-10 rounded-full"
          >
            <Plus className="h-4 w-4" />
            Assign
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="h-10 rounded-full xl:ml-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}
