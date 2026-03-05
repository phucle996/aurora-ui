import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import api, { getErrorMessage } from "@/lib/api/api-ums";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WorkspaceBreadcrumb } from "./sections/workspace-breadcrumb";
import { WorkspaceOverview } from "./sections/workspace-overview";
import { WorkspaceToolbar } from "./sections/workspace-toolbar";
import { WorkspaceTable } from "./sections/workspace-table";
import { WorkspaceCreateDialog } from "./sections/workspace-create-dialog";
import type { WorkspaceItem, WorkspaceListResponse } from "./sections/types";

type CreateWorkspaceResponse = {
  data?: WorkspaceItem;
};

const getString = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string") return value;
  }
  return undefined;
};

const normalizeWorkspace = (item: Record<string, unknown>): WorkspaceItem => ({
  id: getString(item, "id", "ID") ?? "",
  tenant_id: getString(item, "tenant_id", "TenantID") ?? null,
  tenant_name: getString(item, "tenant_name", "TenantName") ?? null,
  tenant_domain: getString(item, "tenant_domain", "TenantDomain") ?? null,
  name: getString(item, "name", "Name") ?? "Untitled",
  slug: getString(item, "slug", "Slug") ?? null,
  created_at: getString(item, "created_at", "CreatedAt") ?? null,
  updated_at: getString(item, "updated_at", "UpdatedAt") ?? null,
});

const parseWorkspaceList = (
  payload: WorkspaceListResponse,
): WorkspaceItem[] => {
  const list = Array.isArray(payload)
    ? payload
    : ((payload as { data?: WorkspaceItem[] })?.data ?? []);
  if (!Array.isArray(list)) return [];
  return list.map((item) =>
    normalizeWorkspace(item as Record<string, unknown>),
  );
};

const searchMatch = (workspace: WorkspaceItem, keyword: string) => {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return (
    workspace.name.toLowerCase().includes(q) ||
    (workspace.slug ?? "").toLowerCase().includes(q) ||
    (workspace.tenant_name ?? "").toLowerCase().includes(q) ||
    (workspace.tenant_domain ?? "").toLowerCase().includes(q)
  );
};

export default function WorkspacePage() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const workspaceQuery = useQuery({
    queryKey: ["org-workspaces"],
    queryFn: async () => {
      const res = await api.get<WorkspaceListResponse>("/org/workspaces");
      return parseWorkspaceList(res.data);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; slug?: string }) => {
      await api.post<CreateWorkspaceResponse>("/org/workspaces", {
        name: payload.name,
        slug: payload.slug,
      });
    },
    onSuccess: async () => {
      toast.success("Workspace created");
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["org-workspaces"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to create workspace"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (workspaceID: string) => {
      await api.delete(`/org/workspaces/${workspaceID}`);
    },
    onSuccess: async () => {
      toast.success("Workspace deleted");
      await queryClient.invalidateQueries({ queryKey: ["org-workspaces"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to delete workspace"));
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const tenantOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of workspaceQuery.data ?? []) {
      if (!row.tenant_id) continue;
      const label = row.tenant_name || row.tenant_domain || row.tenant_id;
      map.set(row.tenant_id, label);
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [workspaceQuery.data]);

  const filteredRows = useMemo(() => {
    const rows = workspaceQuery.data ?? [];
    return rows.filter((row) => {
      if (tenantFilter !== "all" && row.tenant_id !== tenantFilter)
        return false;
      return searchMatch(row, searchText);
    });
  }, [workspaceQuery.data, searchText, tenantFilter]);

  const stats = useMemo(() => {
    const rows = workspaceQuery.data ?? [];
    const tenantSet = new Set(rows.map((row) => row.tenant_id).filter(Boolean));
    const tenantLinked = rows.filter((row) => !!row.tenant_id).length;
    return {
      total: rows.length,
      tenantLinked,
      personal: rows.length - tenantLinked,
      tenants: tenantSet.size,
    };
  }, [workspaceQuery.data]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <WorkspaceBreadcrumb />

      <WorkspaceOverview
        total={stats.total}
        tenantLinked={stats.tenantLinked}
        personal={stats.personal}
        tenants={stats.tenants}
      />

      <section className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <WorkspaceToolbar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          tenantFilter={tenantFilter}
          onTenantFilterChange={setTenantFilter}
          tenantOptions={tenantOptions}
          onCreateClick={() => setCreateOpen(true)}
          onRefresh={() => workspaceQuery.refetch()}
          isRefreshing={workspaceQuery.isFetching}
        />

        {workspaceQuery.isError && (
          <Alert
            variant="destructive"
            className="mt-4 border-rose-300/40 bg-rose-50/70 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(
                workspaceQuery.error,
                "Unable to load workspaces",
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <WorkspaceTable
            rows={filteredRows}
            isLoading={workspaceQuery.isLoading}
            deletingId={deletingId}
            onDelete={(workspace) => {
              const accepted = window.confirm(
                `Delete workspace "${workspace.name}"? This action cannot be undone.`,
              );
              if (!accepted) return;
              setDeletingId(workspace.id);
              deleteMutation.mutate(workspace.id);
            }}
          />
        </div>
      </section>

      <WorkspaceCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSubmitting={createMutation.isPending}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
