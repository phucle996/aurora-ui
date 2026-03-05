import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateTenantPayload = {
  name: string;
  domain: string;
};

type TenantCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateTenantPayload) => Promise<void>;
  isSubmitting?: boolean;
};

export function TenantCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: TenantCreateDialogProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  const canSubmit = useMemo(
    () => name.trim().length > 0 && domain.trim().length > 0,
    [name, domain],
  );

  const resetForm = () => {
    setName("");
    setDomain("");
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    await onSubmit({
      name: name.trim(),
      domain: domain.trim().toLowerCase(),
    });
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isSubmitting) {
          resetForm();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Tenant</DialogTitle>
          <DialogDescription>
            Create a new tenant boundary. Domain must be unique.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenant-name">Name</Label>
            <Input
              id="tenant-name"
              placeholder="Tenant name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-domain">Domain</Label>
            <Input
              id="tenant-domain"
              placeholder="acme.example.com"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
