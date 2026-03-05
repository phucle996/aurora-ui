import { useState } from "react";
import { AvatarUploadDialog } from "./avatar-upload-dialog";

type ProfileAvatarProps = {
  name?: string | null;
  avatarUrl?: string | null;
  onUploaded?: () => void;
};

export function ProfileAvatar({
  name,
  avatarUrl,
  onUploaded,
}: ProfileAvatarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex items-start justify-center py-2">
      <div className="flex flex-col items-center gap-4 text-center">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="group relative h-[240px] w-[240px] overflow-hidden rounded-full border border-slate-200/70 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 dark:border-white/10 dark:bg-slate-900/70"
          aria-label="Upload avatar"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
              <span className="text-xs">No avatar</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M12 20h9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </button>
        {name ? (
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {name}
          </p>
        ) : null}
      </div>
      <AvatarUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentAvatar={avatarUrl}
        onUploaded={onUploaded}
      />
    </div>
  );
}
