import { useState } from "react";
import { toast } from "sonner";

import { NewComputingAccessSection } from "./sections/NewComputingAccessSection";
import { NewComputingHeaderSection } from "./sections/NewComputingHeaderSection";
import { NewComputingInfrastructureSection } from "./sections/NewComputingInfrastructureSection";
import { NewComputingNotesSection } from "./sections/NewComputingNotesSection";
import { NewComputingProfileSection } from "./sections/NewComputingProfileSection";
import { NewComputingReviewSection } from "./sections/NewComputingReviewSection";
import { DEFAULT_NEW_VM_FORM, type NewVMForm } from "./sections/new-computing.types";

export default function NewComputingPage() {
  const [form, setForm] = useState<NewVMForm>(DEFAULT_NEW_VM_FORM);

  const handlePatch = (patch: Partial<NewVMForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error("VM name is required");
      return;
    }
    if (form.sshMethod === "key" && !form.sshKeyName.trim()) {
      toast.error("SSH key name is required");
      return;
    }
    if (form.sshMethod === "password" && form.rootPassword.trim().length < 12) {
      toast.error("Root password must be at least 12 characters");
      return;
    }

    toast.success("New VM payload is ready for API integration");
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <NewComputingHeaderSection onCreate={handleCreate} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <NewComputingProfileSection form={form} onChange={handlePatch} />
          <NewComputingInfrastructureSection form={form} onChange={handlePatch} />
          <NewComputingAccessSection form={form} onChange={handlePatch} />
          <NewComputingNotesSection form={form} onChange={handlePatch} />
        </div>

        <div className="space-y-6">
          <NewComputingReviewSection form={form} onCreate={handleCreate} />
        </div>
      </div>
    </div>
  );
}
