import { MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TenantItem } from "./types";

type TenantTableProps = {
  rows: TenantItem[];
  isLoading: boolean;
  deletingId?: string | null;
  onDelete: (tenant: TenantItem) => void;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export function TenantTable({
  rows,
  isLoading,
  deletingId,
  onDelete,
}: TenantTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
      <Table>
        <TableHeader className="bg-slate-100/70 dark:bg-white/5">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Workspaces</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[64px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Loading tenants...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                No tenant found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            rows.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {tenant.name}
                </TableCell>
                <TableCell>{tenant.domain}</TableCell>
                <TableCell>{tenant.workspace_count ?? 0}</TableCell>
                <TableCell>{tenant.user_count ?? 0}</TableCell>
                <TableCell>{formatDate(tenant.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={deletingId === tenant.id}
                        onClick={() => onDelete(tenant)}
                        className="text-rose-600 focus:text-rose-600 dark:text-rose-300 dark:focus:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === tenant.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
