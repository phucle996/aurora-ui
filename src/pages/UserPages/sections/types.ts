export type WorkspaceItem = {
  id: string;
  tenant_id?: string | null;
  tenant_name?: string | null;
  tenant_domain?: string | null;
  name: string;
  slug?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type WorkspaceListResponse = {
  data?: WorkspaceItem[];
} | WorkspaceItem[];

export type TenantItem = {
  id: string;
  name: string;
  domain: string;
  workspace_count?: number;
  user_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TenantListResponse = {
  data?: TenantItem[];
} | TenantItem[];

export type UserRoleItem = {
  id: string;
  name: string;
  scope?: string | null;
  tenant_id?: string | null;
  description?: string | null;
  created_at?: string | null;
};

export type PermissionItem = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
};

export type RoleListResponse = {
  data?: UserRoleItem[];
} | UserRoleItem[];

export type PermissionListResponse = {
  data?: PermissionItem[];
} | PermissionItem[];
