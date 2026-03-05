import { useState } from "react";
import { Bell, Globe, Shield, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function GeneralSettingsSection() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const [enforceMfa, setEnforceMfa] = useState(true);

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <Card className="border-slate-200/70 bg-white/80 shadow-none backdrop-blur xl:col-span-8 dark:border-white/10 dark:bg-slate-950/60">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4 text-indigo-500" />
            General configuration
          </CardTitle>
          <CardDescription>
            Workspace identity, localization, and default preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input id="workspace-name" defaultValue="Aurora Cloud" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-slug">Workspace slug</Label>
              <Input id="workspace-slug" defaultValue="aurora-cloud" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Asia/Ho_Chi_Minh" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locale">Default locale</Label>
              <Input id="locale" defaultValue="en-US" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="domain">Primary domain</Label>
              <Input id="domain" defaultValue="auth.aurora.local" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300/80 dark:border-white/15"
            >
              Reset
            </Button>
            <Button type="button" className="bg-indigo-500 hover:bg-indigo-400">
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80 shadow-none backdrop-blur xl:col-span-4 dark:border-white/10 dark:bg-slate-950/60">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-emerald-500" />
            Security defaults
          </CardTitle>
          <CardDescription>
            Baseline security for all users in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200/80 p-3 dark:border-white/10">
            <div>
              <p className="text-sm font-medium">Enforce MFA for admins</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Require two-factor auth for privileged accounts.
              </p>
            </div>
            <Switch checked={enforceMfa} onCheckedChange={setEnforceMfa} />
          </div>
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200/80 p-3 dark:border-white/10">
            <div className="flex gap-2">
              <Bell className="mt-0.5 h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium">Email alerts</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Send alerts for risky sign-ins and lockouts.
                </p>
              </div>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200/80 p-3 dark:border-white/10">
            <div className="flex gap-2">
              <Globe className="mt-0.5 h-4 w-4 text-sky-500" />
              <div>
                <p className="text-sm font-medium">Browser notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  In-app alerts for admin and billing updates.
                </p>
              </div>
            </div>
            <Switch
              checked={browserAlerts}
              onCheckedChange={setBrowserAlerts}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
