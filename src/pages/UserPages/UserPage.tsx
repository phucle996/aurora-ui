import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import api, { getErrorMessage } from "@/lib/api/api-ums";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserBreadcrumb } from "./sections/user-breadcrumb";
import { UserOverview } from "./sections/user-overview";
import { UserToolbar } from "./sections/user-toolbar";
import { UserRolesTable } from "./sections/user-roles-table";
import { UserPermissionsTable } from "./sections/user-permissions-table";
import type {
  PermissionItem,
  PermissionListResponse,
  RoleListResponse,
  UserRoleItem,
} from "./sections/types";

type MeResponse = {
  data?: {
    id?: string;
  };
  id?: string;
};

const getString = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string") return value;
  }
  return undefined;
};

const normalizeRole = (item: Record<string, unknown>): UserRoleItem => ({
  id: getString(item, "id", "ID") ?? "",
  name: getString(item, "name", "Name") ?? "unknown",
  scope: getString(item, "scope", "Scope") ?? "global",
  tenant_id: getString(item, "tenant_id", "TenantID") ?? null,
  description: getString(item, "description", "Description") ?? null,
  created_at: getString(item, "created_at", "CreatedAt") ?? null,
});

const normalizePermission = (
  item: Record<string, unknown>,
): PermissionItem => ({
  id: getString(item, "id", "ID") ?? "",
  name: getString(item, "name", "Name") ?? "unknown",
  description: getString(item, "description", "Description") ?? null,
  created_at: getString(item, "created_at", "CreatedAt") ?? null,
});

const parseRoleList = (payload: RoleListResponse): UserRoleItem[] => {
  const list = Array.isArray(payload)
    ? payload
    : ((payload as { data?: UserRoleItem[] })?.data ?? []);
  if (!Array.isArray(list)) return [];
  return list.map((item) => normalizeRole(item as Record<string, unknown>));
};

const parsePermissionList = (
  payload: PermissionListResponse,
): PermissionItem[] => {
  const list = Array.isArray(payload)
    ? payload
    : ((payload as { data?: PermissionItem[] })?.data ?? []);
  if (!Array.isArray(list)) return [];
  return list.map((item) =>
    normalizePermission(item as Record<string, unknown>),
  );
};

const searchRole = (role: UserRoleItem, keyword: string) => {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return (
    role.name.toLowerCase().includes(q) ||
    (role.scope ?? "").toLowerCase().includes(q) ||
    (role.description ?? "").toLowerCase().includes(q)
  );
};

const searchPermission = (permission: PermissionItem, keyword: string) => {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return (
    permission.name.toLowerCase().includes(q) ||
    (permission.description ?? "").toLowerCase().includes(q)
  );
};

export default function UserPage() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [removingRoleId, setRemovingRoleId] = useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get<MeResponse>("/auth/me");
      return res.data;
    },
  });

  const userID = meQuery.data?.data?.id ?? meQuery.data?.id ?? "";

  const userRolesQuery = useQuery({
    queryKey: ["rbac-user-roles", userID],
    enabled: userID.length > 0,
    queryFn: async () => {
      const res = await api.get<RoleListResponse>(
        `/rbac/users/${userID}/roles`,
      );
      return parseRoleList(res.data);
    },
  });

  const userPermissionsQuery = useQuery({
    queryKey: ["rbac-user-permissions", userID],
    enabled: userID.length > 0,
    queryFn: async () => {
      const res = await api.get<PermissionListResponse>(
        `/rbac/users/${userID}/permissions`,
      );
      return parsePermissionList(res.data);
    },
  });

  const allRolesQuery = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: async () => {
      const res = await api.get<RoleListResponse>("/rbac/roles");
      return parseRoleList(res.data);
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (roleID: string) => {
      await api.post(`/rbac/users/${userID}/roles/${roleID}`, {});
    },
    onSuccess: async () => {
      toast.success("Role assigned");
      await queryClient.invalidateQueries({
        queryKey: ["rbac-user-roles", userID],
      });
      await queryClient.invalidateQueries({
        queryKey: ["rbac-user-permissions", userID],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to assign role"));
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleID: string) => {
      await api.delete(`/rbac/users/${userID}/roles/${roleID}`);
    },
    onSuccess: async () => {
      toast.success("Role removed");
      await queryClient.invalidateQueries({
        queryKey: ["rbac-user-roles", userID],
      });
      await queryClient.invalidateQueries({
        queryKey: ["rbac-user-permissions", userID],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to remove role"));
    },
    onSettled: () => {
      setRemovingRoleId(null);
    },
  });

  const roleOptions = useMemo(() => {
    const assigned = new Set(
      (userRolesQuery.data ?? []).map((role) => role.id),
    );
    return (allRolesQuery.data ?? [])
      .filter((role) => !assigned.has(role.id))
      .map((role) => ({
        id: role.id,
        label: `${role.name} (${role.scope ?? "global"})`,
      }));
  }, [allRolesQuery.data, userRolesQuery.data]);

  const selectedRoleIdResolved = useMemo(() => {
    if (
      selectedRoleId &&
      roleOptions.some((item) => item.id === selectedRoleId)
    ) {
      return selectedRoleId;
    }
    return roleOptions[0]?.id ?? "none";
  }, [roleOptions, selectedRoleId]);

  const filteredRoles = useMemo(() => {
    const roles = userRolesQuery.data ?? [];
    return roles.filter((role) => searchRole(role, searchText));
  }, [userRolesQuery.data, searchText]);

  const filteredPermissions = useMemo(() => {
    const permissions = userPermissionsQuery.data ?? [];
    return permissions.filter((permission) =>
      searchPermission(permission, searchText),
    );
  }, [userPermissionsQuery.data, searchText]);

  const stats = useMemo(() => {
    const roles = userRolesQuery.data ?? [];
    const permissions = userPermissionsQuery.data ?? [];
    const globalRoles = roles.filter((role) => role.scope !== "tenant").length;
    const tenantRoles = roles.length - globalRoles;
    return {
      totalRoles: roles.length,
      totalPermissions: permissions.length,
      globalRoles,
      tenantRoles,
    };
  }, [userPermissionsQuery.data, userRolesQuery.data]);

  const hasError =
    meQuery.isError || userRolesQuery.isError || userPermissionsQuery.isError;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <UserBreadcrumb />

      <UserOverview
        totalRoles={stats.totalRoles}
        totalPermissions={stats.totalPermissions}
        globalRoles={stats.globalRoles}
        tenantRoles={stats.tenantRoles}
      />

      <section className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <UserToolbar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          selectedRoleId={selectedRoleIdResolved}
          onSelectedRoleIdChange={setSelectedRoleId}
          roleOptions={roleOptions}
          onAssignRole={() => {
            if (!selectedRoleIdResolved || selectedRoleIdResolved === "none")
              return;
            assignRoleMutation.mutate(selectedRoleIdResolved);
          }}
          assignDisabled={
            !selectedRoleIdResolved ||
            selectedRoleIdResolved === "none" ||
            !userID ||
            assignRoleMutation.isPending ||
            allRolesQuery.isLoading
          }
          onRefresh={() => {
            meQuery.refetch();
            userRolesQuery.refetch();
            userPermissionsQuery.refetch();
            allRolesQuery.refetch();
          }}
          isRefreshing={
            meQuery.isFetching ||
            userRolesQuery.isFetching ||
            userPermissionsQuery.isFetching
          }
        />

        {hasError && (
          <Alert
            variant="destructive"
            className="mt-4 border-rose-300/40 bg-rose-50/70 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(
                meQuery.error ??
                  userRolesQuery.error ??
                  userPermissionsQuery.error,
                "Unable to load user access data",
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <article className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Assigned Roles
            </h3>
            <UserRolesTable
              rows={filteredRoles}
              isLoading={userRolesQuery.isLoading || meQuery.isLoading}
              removingRoleId={removingRoleId}
              onRemoveRole={(role) => {
                const accepted = window.confirm(
                  `Remove role "${role.name}" from this user?`,
                );
                if (!accepted) return;
                setRemovingRoleId(role.id);
                removeRoleMutation.mutate(role.id);
              }}
            />
          </article>

          <article className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Effective Permissions
            </h3>
            <UserPermissionsTable
              rows={filteredPermissions}
              isLoading={userPermissionsQuery.isLoading || meQuery.isLoading}
            />
          </article>
        </div>
      </section>
    </div>
  );
}
