import { Cpu, HardDrive, MemoryStick } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  IMAGE_OPTIONS,
  REGION_OPTIONS,
  ZONE_OPTIONS,
  FLAVOR_OPTIONS,
  findFlavor,
  type NewVMForm,
} from "./new-computing.types";

type Props = {
  form: NewVMForm;
  onChange: (patch: Partial<NewVMForm>) => void;
};

export function NewComputingInfrastructureSection({ form, onChange }: Props) {
  const selectedFlavor = findFlavor(form.flavor);

  return (
    <Card className="border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle>Infrastructure</CardTitle>
        <CardDescription>
          Choose region, zone, OS image, and flavor to define performance envelope.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={form.region} onValueChange={(value) => onChange({ region: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Zone</Label>
            <Select value={form.zone} onValueChange={(value) => onChange({ zone: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {ZONE_OPTIONS.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <Select value={form.image} onValueChange={(value) => onChange({ image: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select image" />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_OPTIONS.map((image) => (
                  <SelectItem key={image.value} value={image.value}>
                    {image.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Flavor</Label>
            <Select value={form.flavor} onValueChange={(value) => onChange({ flavor: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select flavor" />
              </SelectTrigger>
              <SelectContent>
                {FLAVOR_OPTIONS.map((flavor) => (
                  <SelectItem key={flavor.value} value={flavor.value}>
                    {flavor.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">vCPU</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-semibold">{selectedFlavor.cpu}</p>
              <Cpu className="h-4 w-4 text-indigo-400" />
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">RAM</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-semibold">{selectedFlavor.ramGB} GB</p>
              <MemoryStick className="h-4 w-4 text-violet-400" />
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">Root disk</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-semibold">{selectedFlavor.diskGB} GB</p>
              <HardDrive className="h-4 w-4 text-sky-400" />
            </div>
          </article>
        </div>
      </CardContent>
    </Card>
  );
}
