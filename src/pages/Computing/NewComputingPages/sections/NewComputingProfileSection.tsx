import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import type { NewVMForm } from "./new-computing.types";

type Props = {
  form: NewVMForm;
  onChange: (patch: Partial<NewVMForm>) => void;
};

export function NewComputingProfileSection({ form, onChange }: Props) {
  return (
    <Card className="border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle>Instance Profile</CardTitle>
        <CardDescription>
          Core identity used in inventory, logs, billing labels, and automation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="vm-name">VM name</Label>
          <Input
            id="vm-name"
            placeholder="e.g. payment-api-prod-01"
            value={form.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="vm-description">Description</Label>
          <Textarea
            id="vm-description"
            placeholder="Purpose, owner, runbook, and deployment notes"
            value={form.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
