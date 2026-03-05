import { DollarSign, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { findFlavor, IMAGE_OPTIONS, NETWORK_OPTIONS, REGION_OPTIONS, ZONE_OPTIONS, type NewVMForm } from "./new-computing.types";

type Props = {
  form: NewVMForm;
  onCreate: () => void;
};

const findLabel = (options: Array<{ value: string; label: string }>, value: string) =>
  options.find((item) => item.value === value)?.label ?? value;

export function NewComputingReviewSection({ form, onCreate }: Props) {
  const flavor = findFlavor(form.flavor);

  return (
    <Card className="border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle>Deployment Review</CardTitle>
        <CardDescription>
          Final summary before provisioning the VM into selected infrastructure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border border-slate-200 p-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Instance name</p>
            <Badge variant="secondary">{form.name || "untitled-vm"}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Region / Zone</p>
              <p className="font-medium">
                {findLabel(REGION_OPTIONS, form.region)} / {findLabel(ZONE_OPTIONS, form.zone)}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Image</p>
              <p className="font-medium">{findLabel(IMAGE_OPTIONS, form.image)}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Flavor</p>
              <p className="font-medium">{flavor.label}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Network</p>
              <p className="font-medium">{findLabel(NETWORK_OPTIONS, form.network)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-indigo-200/70 bg-indigo-50/60 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Estimated monthly
              </p>
              <p className="mt-1 text-2xl font-semibold">${flavor.monthlyUSD}</p>
            </div>
            <DollarSign className="h-5 w-5 text-indigo-500" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-violet-500" />
            <p>
              After deploy, bootstrap scripts will run and VM appears in inventory after first agent heartbeat.
            </p>
          </div>
        </div>

        <Button className="w-full" onClick={onCreate}>
          Create VM Now
        </Button>
      </CardContent>
    </Card>
  );
}
