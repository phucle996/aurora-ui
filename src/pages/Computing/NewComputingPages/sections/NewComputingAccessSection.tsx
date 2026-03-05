import { KeyRound, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { NETWORK_OPTIONS, type NewVMForm } from "./new-computing.types";

type Props = {
  form: NewVMForm;
  onChange: (patch: Partial<NewVMForm>) => void;
};

export function NewComputingAccessSection({ form, onChange }: Props) {
  return (
    <Card className="border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle>Network & Access</CardTitle>
        <CardDescription>
          Define connectivity and bootstrap security method for first login.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Network</Label>
            <Select value={form.network} onValueChange={(value) => onChange({ network: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {NETWORK_OPTIONS.map((network) => (
                  <SelectItem key={network.value} value={network.value}>
                    {network.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end rounded-lg border border-slate-200 p-4 dark:border-white/10">
            <div className="flex w-full items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Assign public IP</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allow direct SSH/RDP from internet with firewall policy.
                </p>
              </div>
              <Switch
                checked={form.publicIpEnabled}
                onCheckedChange={(checked) => onChange({ publicIpEnabled: checked })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Authentication method</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={form.sshMethod === "key" ? "default" : "outline"}
              onClick={() => onChange({ sshMethod: "key", rootPassword: "" })}
            >
              <KeyRound className="h-4 w-4" />
              SSH key
            </Button>
            <Button
              type="button"
              variant={form.sshMethod === "password" ? "default" : "outline"}
              onClick={() => onChange({ sshMethod: "password", sshKeyName: "" })}
            >
              <Lock className="h-4 w-4" />
              Password
            </Button>
          </div>
        </div>

        {form.sshMethod === "key" ? (
          <div className="space-y-2">
            <Label htmlFor="ssh-key">SSH key name</Label>
            <Input
              id="ssh-key"
              placeholder="e.g. admin-rsa-main"
              value={form.sshKeyName}
              onChange={(event) => onChange({ sshKeyName: event.target.value })}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="root-password">Root password</Label>
            <Input
              id="root-password"
              type="password"
              placeholder="At least 12 chars"
              value={form.rootPassword}
              onChange={(event) => onChange({ rootPassword: event.target.value })}
            />
          </div>
        )}

        <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/60 p-3 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4" />
            <p>
              Security baseline will enable UFW rules, fail2ban, automatic updates, and auditd.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
