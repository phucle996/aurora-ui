import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import type { NewVMForm } from "./new-computing.types";

type Props = {
  form: NewVMForm;
  onChange: (patch: Partial<NewVMForm>) => void;
};

export function NewComputingNotesSection({ form, onChange }: Props) {
  return (
    <Card className="border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle>Cloud-init User Data</CardTitle>
        <CardDescription>
          Optional bootstrap script executed on first startup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="user-data" className="sr-only">
          User data
        </Label>
        <Textarea
          id="user-data"
          className="min-h-36 font-mono text-xs"
          value={form.userData}
          onChange={(event) => onChange({ userData: event.target.value })}
        />
      </CardContent>
    </Card>
  );
}
