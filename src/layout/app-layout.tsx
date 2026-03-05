import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "next-themes";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const defaultTabs = [
  { key: "overview", label: "Overview" },
  { key: "transactions", label: "Transactions" },
  { key: "accounts", label: "Accounts" },
  { key: "budgets", label: "Budgets" },
  { key: "analytics", label: "Analytics" },
  { key: "reports", label: "Reports" },
];

export default function AppLayout() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const tabs = useMemo(() => defaultTabs, []);
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const background = isDark
    ? "linear-gradient(160deg, #070b1f 0%, #0a122c 45%, #05060e 100%)"
    : "linear-gradient(150deg, #f2f4fb 0%, #f5f1f7 40%, #f6eaef 75%, #f7e6da 100%)";

  return (
    <SidebarProvider>
      <div
        className="relative min-h-screen w-full overflow-x-hidden text-slate-900 transition-[background] duration-700 ease-out dark:text-slate-100"
        style={
          {
            background,
            "--sidebar": isDark
              ? "rgba(7, 11, 31, 0.9)"
              : "rgba(255,255,255,0.86)",
            "--sidebar-foreground": isDark
              ? "rgb(226 232 240)"
              : "rgb(30 41 59)",
            "--sidebar-accent": isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(15,23,42,0.06)",
            "--sidebar-accent-foreground": isDark
              ? "rgb(226 232 240)"
              : "rgb(30 41 59)",
            "--sidebar-border": isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(15,23,42,0.08)",
          } as CSSProperties
        }
      >
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
          <div className="absolute -right-24 top-16 h-64 w-64 rounded-full bg-indigo-500/18 blur-3xl" />
          <div className="absolute -left-24 bottom-10 h-56 w-56 rounded-full bg-purple-500/16 blur-3xl" />
        </div>
        <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-transparent">
          <AppHeader
            appName="Aurora"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            primaryActionLabel="Create Budget"
            onPrimaryAction={() => {}}
            onSearch={() => {}}
            onSettings={() => {}}
          />
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
