"use client";

import * as React from "react";
import {
  UserIcon,
  Command,
  Frame,
  LifeBuoy,
  PieChart,
  Send,
  Settings2,
  LayoutDashboard,
  Key,
  ContainerIcon,
  AppWindowMac,
  Database,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/api-ums";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      requiredPermission: "user.read",
    },
    {
      title: "User Managment",
      url: "#",
      icon: UserIcon,
      requiredPermission: ["workspace.read", "tenant.read", "user.read"],
      items: [
        {
          title: "Tenant",
          url: "/tenants",
          requiredPermission: "tenant.read",
          onlyGlobalScope: true,
        },
        {
          title: "Workspace",
          url: "/workspaces",
          requiredPermission: "workspace.read",
        },
        {
          title: "User",
          url: "/users",
          requiredPermission: "user.read",
          onlyTenantScope: true,
        },
      ],
    },
    {
      title: "VMs",
      url: "#",
      icon: UserIcon,
      requiredPermission: "user.read",
      items: [
        {
          title: "Computing",
          url: "/computing",
          requiredPermission: "user.read",
        },
        {
          title: "Networking",
          url: "#",
          requiredPermission: "user.read",
        },
        {
          title: "Firewall",
          url: "#",
          requiredPermission: "user.read",
        },
      ],
    },
    {
      title: "Containers",
      url: "#",
      icon: ContainerIcon,
      items: [
        { title: "Docker", url: "#" },
        { title: "Kubernetes", url: "#" },
        { title: "Images", url: "#" },
        { title: "Logs", url: "#" },
      ],
    },
    {
      title: "Platform Services",
      url: "#",
      icon: AppWindowMac,
      requiredPermission: "user.read",
      items: [
        {
          title: "PaaS Apps",
          url: "/paas",
          requiredPermission: "user.read",
        },
        {
          title: "DBaaS Instances",
          url: "/dbaas",
          requiredPermission: "user.read",
        },
      ],
    },
    {
      title: "Access and Policies",
      url: "#",
      icon: Key,
      requiredPermission: ["role.read", "permission.read"],
      items: [
        {
          title: "Role Managment ",
          url: "#",
          requiredPermission: "role.read",
        },
        {
          title: "API Key",
          url: "#",
          requiredPermission: "permission.read",
        },

        {
          title: "History Access",
          url: "#",
          requiredPermission: "permission.read",
        },
      ],
    },

    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      requiredPermission: "user.read",
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Databases",
      url: "#",
      icon: Database,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get<{
        data?: {
          permissions?: string[];
          tenant_id?: string | null;
        };
        permissions?: string[];
        tenant_id?: string | null;
      }>("/auth/me");
      return res.data;
    },
    staleTime: 30_000,
  });

  const permissionSet = new Set(
    meQuery.data?.data?.permissions ?? meQuery.data?.permissions ?? [],
  );
  const currentTenantID =
    meQuery.data?.data?.tenant_id ?? meQuery.data?.tenant_id ?? null;
  const isTenantSession =
    typeof currentTenantID === "string" && currentTenantID.trim().length > 0;

  const canView = (required?: string | string[]) => {
    if (!required) return true;
    if (permissionSet.size === 0) return false;
    if (Array.isArray(required)) {
      return required.some((permission) => permissionSet.has(permission));
    }
    return permissionSet.has(required);
  };

  const navMain = data.navMain
    .map((item) => {
      if (
        !canView(
          (item as { requiredPermission?: string | string[] })
            .requiredPermission,
        )
      ) {
        return null;
      }

      if (!item.items?.length) {
        return item;
      }

      const nextItems = item.items.filter((subItem) =>
        (() => {
          const typed = subItem as {
            requiredPermission?: string | string[];
            onlyTenantScope?: boolean;
            onlyGlobalScope?: boolean;
          };
          if (typed.onlyTenantScope && !isTenantSession) {
            return false;
          }
          if (typed.onlyGlobalScope && isTenantSession) {
            return false;
          }
          return canView(typed.requiredPermission);
        })(),
      );

      if (nextItems.length === 0) {
        return null;
      }

      return { ...item, items: nextItems };
    })
    .filter(Boolean) as typeof data.navMain;

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
