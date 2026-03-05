import { Copy } from "lucide-react";
import { toast } from "sonner";

type AccountDetailsProps = {
  id?: string | null;
  email?: string | null;
  status?: string | null;
};

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "—";
  const asString = String(value);
  return asString.trim() ? asString : "—";
};

export function AccountDetails({
  id,
  email,
  status,
}: AccountDetailsProps) {
  const handleCopy = async () => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(String(id));
      toast.success("User ID copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Core identity and access status
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            User ID
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-1 inline-flex w-full items-center gap-2 rounded-lg border border-transparent px-1 py-0.5 text-left text-sm font-medium text-slate-800 transition hover:border-slate-200 hover:bg-slate-50 dark:text-slate-100 dark:hover:border-white/10 dark:hover:bg-white/5"
            title="Copy user ID"
          >
            <span className="min-w-0 flex-1 truncate whitespace-nowrap">
              {formatValue(id)}
            </span>
            <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          </button>
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Email
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">
            {formatValue(email)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Status
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate whitespace-nowrap">
            {formatValue(status)}
          </p>
        </div>
      </div>
    </section>
  );
}
