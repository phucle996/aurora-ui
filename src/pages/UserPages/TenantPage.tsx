import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import api, { getErrorMessage } from "@/lib/api/api-ums";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TenantBreadcrumb } from "./sections/tenant-breadcrumb";
import { TenantOverview } from "./sections/tenant-overview";
import { TenantToolbar } from "./sections/tenant-toolbar";
import { TenantTable } from "./sections/tenant-table";
import { TenantCreateDialog } from "./sections/tenant-create-dialog";
import type { TenantItem, TenantListResponse } from "./sections/types";

type CreateTenantResponse = {
  data?: TenantItem;
};

const getString = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string") return value;
  }
  return undefined;
};

const getNumber = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number") return value;
  }
  return 0;
};

const normalizeTenant = (item: Record<string, unknown>): TenantItem => ({
  id: getString(item, "id", "ID") ?? "",
  name: getString(item, "name", "Name") ?? "Untitled",
  domain: getString(item, "domain", "Domain") ?? "-",
  workspace_count: getNumber(item, "workspace_count", "WorkspaceCount"),
  user_count: getNumber(item, "user_count", "UserCount"),
  created_at: getString(item, "created_at", "CreatedAt") ?? null,
  updated_at: getString(item, "updated_at", "UpdatedAt") ?? null,
});

const parseTenantList = (payload: TenantListResponse): TenantItem[] => {
  const list = Array.isArray(payload)
    ? payload
    : ((payload as { data?: TenantItem[] })?.data ?? []);
  if (!Array.isArray(list)) return [];
  return list.map((item) => normalizeTenant(item as Record<string, unknown>));
};

const searchMatch = (tenant: TenantItem, keyword: string) => {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return (
    tenant.name.toLowerCase().includes(q) ||
    tenant.domain.toLowerCase().includes(q)
  );
};

export default function TenantPage() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tenantQuery = useQuery({
    queryKey: ["org-tenants"],
    queryFn: async () => {
      const res = await api.get<TenantListResponse>("/org/tenants");
      return parseTenantList(res.data);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; domain: string }) => {
      await api.post<CreateTenantResponse>("/org/tenants", payload);
    },
    onSuccess: async () => {
      toast.success("Tenant created");
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["org-tenants"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to create tenant"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (tenantID: string) => {
      await api.delete(`/org/tenants/${tenantID}`);
    },
    onSuccess: async () => {
      toast.success("Tenant deleted");
      await queryClient.invalidateQueries({ queryKey: ["org-tenants"] });
      await queryClient.invalidateQueries({ queryKey: ["org-workspaces"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to delete tenant"));
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const filteredRows = useMemo(() => {
    const rows = tenantQuery.data ?? [];
    return rows.filter((row) => searchMatch(row, searchText));
  }, [tenantQuery.data, searchText]);

  const stats = useMemo(() => {
    const rows = tenantQuery.data ?? [];
    const uniqueDomains = new Set(rows.map((row) => row.domain)).size;
    return {
      totalTenants: rows.length,
      totalWorkspaces: rows.reduce(
        (sum, row) => sum + (row.workspace_count ?? 0),
        0,
      ),
      totalUsers: rows.reduce((sum, row) => sum + (row.user_count ?? 0), 0),
      uniqueDomains,
    };
  }, [tenantQuery.data]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <TenantBreadcrumb />

      <TenantOverview
        totalTenants={stats.totalTenants}
        totalWorkspaces={stats.totalWorkspaces}
        totalUsers={stats.totalUsers}
        uniqueDomains={stats.uniqueDomains}
      />

      <section className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <TenantToolbar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onCreateClick={() => setCreateOpen(true)}
          onRefresh={() => tenantQuery.refetch()}
          isRefreshing={tenantQuery.isFetching}
        />

        {tenantQuery.isError && (
          <Alert
            variant="destructive"
            className="mt-4 border-rose-300/40 bg-rose-50/70 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(tenantQuery.error, "Unable to load tenants")}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <TenantTable
            rows={filteredRows}
            isLoading={tenantQuery.isLoading}
            deletingId={deletingId}
            onDelete={(tenant) => {
              const accepted = window.confirm(
                `Delete tenant "${tenant.name}"? This action detaches related workspaces.`,
              );
              if (!accepted) return;
              setDeletingId(tenant.id);
              deleteMutation.mutate(tenant.id);
            }}
          />
        </div>
      </section>

      <TenantCreateDialog
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
