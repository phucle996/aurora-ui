import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api, { getErrorMessage } from "@/lib/api/api-ums";

type AvatarUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string | null;
  onUploaded?: () => void;
};

export function AvatarUploadDialog({
  open,
  onOpenChange,
  currentAvatar,
  onUploaded,
}: AvatarUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatar ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSelect = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleSelect(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    handleSelect(file);
  };

  const handleUpload = async () => {
    if (!preview) {
      toast.error("Please select an image.");
      return;
    }
    try {
      setIsUploading(true);
      await api.post("/auth/profile", { avatar_url: preview });
      toast.success("Avatar updated");
      onUploaded?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload avatar"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload avatar</DialogTitle>
          <DialogDescription>
            Click to select or drag and drop an image.
          </DialogDescription>
        </DialogHeader>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center transition ${
            isDragging
              ? "border-indigo-400/80 bg-indigo-500/10"
              : "border-slate-200/70 bg-slate-50/60 dark:border-white/10 dark:bg-white/5"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="h-40 w-40 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
              <UploadCloud className="h-8 w-8" />
              <p className="text-sm font-medium">Drop image here</p>
              <p className="text-xs">PNG, JPG, or WEBP</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
