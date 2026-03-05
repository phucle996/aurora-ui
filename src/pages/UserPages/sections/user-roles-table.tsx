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
import type { UserRoleItem } from "./types";

type UserRolesTableProps = {
  rows: UserRoleItem[];
  isLoading: boolean;
  removingRoleId?: string | null;
  onRemoveRole: (role: UserRoleItem) => void;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export function UserRolesTable({
  rows,
  isLoading,
  removingRoleId,
  onRemoveRole,
}: UserRolesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
      <Table>
        <TableHeader className="bg-slate-100/70 dark:bg-white/5">
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[64px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Loading user roles...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                No role assigned for this user.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            rows.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {role.name}
                </TableCell>
                <TableCell>
                  <Badge variant={role.scope === "tenant" ? "secondary" : "default"}>
                    {role.scope ?? "global"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[320px] truncate">
                  {role.description || "-"}
                </TableCell>
                <TableCell>{formatDate(role.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={removingRoleId === role.id}
                        onClick={() => onRemoveRole(role)}
                        className="text-rose-600 focus:text-rose-600 dark:text-rose-300 dark:focus:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        {removingRoleId === role.id ? "Removing..." : "Remove"}
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
