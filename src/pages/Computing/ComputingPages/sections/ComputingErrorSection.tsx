import { AlertTriangle } from "lucide-react";

type Props = {
  message: string;
};

export function ComputingErrorSection({ message }: Props) {
  return (
    <div className="mt-4 rounded-lg border border-rose-300/40 bg-rose-50/70 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>{message}</span>
      </div>
    </div>
  );
}
