import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api/api-ums";

export type AppHeaderProps = {
  appName: string;
  logo?: ReactNode;
  tabs: {
    key: string;
    label: string;
  }[];
  activeTab: string;
  onTabChange: (key: string) => void;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  onSearch: () => void;
  onSettings: () => void;
  userAvatar?: ReactNode;
};

export function AppHeader({
  appName,
  logo,
  tabs,
  activeTab,
  onTabChange,
  onSearch,
  onSettings,
  userAvatar,
}: AppHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout");
      toast.success("Logged out");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Logout failed"));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center gap-6 border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex min-w-[180px] items-end text-slate-700 dark:text-slate-100">
        <SidebarTrigger className="mr-2 h-9 w-9 rounded-full border border-slate-200 text-slate-500 transition-colors duration-500 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" />
        <div className="flex h-8 w-8 items-center justify-center">
          {logo ?? (
            <img
              src="/logo.png"
              alt="Aurora logo"
              className="h-7 w-7 object-contain"
            />
          )}
        </div>
        <span className="text-xl font-semibold tracking-tight">uora</span>
        <span className="sr-only">{appName}</span>
      </div>

      <nav className="flex flex-1 items-center justify-center gap-2">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={
                isActive
                  ? "rounded-full bg-purple-600 px-4 py-1.5 text-sm font-semibold text-white transition"
                  : "rounded-full px-4 py-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="flex min-w-[260px] items-center justify-end gap-2">
        <div className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 text-slate-500 transition-colors duration-500 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-200/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 dark:focus-within:border-indigo-400/60 dark:focus-within:ring-indigo-400/30">
          <button
            type="button"
            onClick={onSearch}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors duration-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="h-7 w-40 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-colors duration-500 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors duration-500 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Toggle theme"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          disabled={!mounted}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors duration-500 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors duration-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              aria-label="Account menu"
            >
              {userAvatar ?? <span className="text-xs font-semibold">UA</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="min-w-44 rounded-lg border border-slate-200/70 bg-white/90 text-slate-900 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100 [&_[data-slot=dropdown-menu-item]]:focus:bg-slate-100 [&_[data-slot=dropdown-menu-item]]:focus:text-slate-900 dark:[&_[data-slot=dropdown-menu-item]]:focus:bg-white/10 dark:[&_[data-slot=dropdown-menu-item]]:focus:text-white"
          >
            <DropdownMenuItem asChild>
              <Link to="/profile">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleLogout();
              }}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
