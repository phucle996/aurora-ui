import { ShieldCheck } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PermissionItem } from "./types";

type UserPermissionsTableProps = {
  rows: PermissionItem[];
  isLoading: boolean;
};

export function UserPermissionsTable({
  rows,
  isLoading,
}: UserPermissionsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
      <Table>
        <TableHeader className="bg-slate-100/70 dark:bg-white/5">
          <TableRow>
            <TableHead>Permission</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={2}
                className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Loading effective permissions...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={2}
                className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                No permission found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            rows.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>{permission.name}</span>
                  </div>
                </TableCell>
                <TableCell>{permission.description || "-"}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
