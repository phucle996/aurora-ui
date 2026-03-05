import { MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { WorkspaceItem } from "./types";

type WorkspaceTableProps = {
  rows: WorkspaceItem[];
  isLoading: boolean;
  deletingId?: string | null;
  onDelete: (workspace: WorkspaceItem) => void;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export function WorkspaceTable({
  rows,
  isLoading,
  deletingId,
  onDelete,
}: WorkspaceTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
      <Table>
        <TableHeader className="bg-slate-100/70 dark:bg-white/5">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Domain</TableHead>
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
                Loading workspaces...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                No workspace found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            rows.map((workspace) => (
              <TableRow key={workspace.id}>
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {workspace.name}
                </TableCell>
                <TableCell>{workspace.slug || "-"}</TableCell>
                <TableCell>
                  {workspace.tenant_name ? (
                    <Badge variant="secondary">{workspace.tenant_name}</Badge>
                  ) : (
                    <span className="text-slate-400">Personal</span>
                  )}
                </TableCell>
                <TableCell>{workspace.tenant_domain || "-"}</TableCell>
                <TableCell>{formatDate(workspace.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={deletingId === workspace.id}
                        onClick={() => onDelete(workspace)}
                        className="text-rose-600 focus:text-rose-600 dark:text-rose-300 dark:focus:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === workspace.id ? "Deleting..." : "Delete"}
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
