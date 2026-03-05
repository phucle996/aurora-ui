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

type CreateWorkspacePayload = {
  name: string;
  slug?: string;
};

type WorkspaceCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateWorkspacePayload) => Promise<void>;
  isSubmitting?: boolean;
};

export function WorkspaceCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: WorkspaceCreateDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const resetForm = () => {
    setName("");
    setSlug("");
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    await onSubmit({
      name: name.trim(),
      slug: slug.trim() || undefined,
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
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a workspace in your current scope (tenant or global).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              placeholder="Workspace name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workspace-slug">Slug (optional)</Label>
            <Input
              id="workspace-slug"
              placeholder="workspace-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
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
