import { Building2, Layers3, UserSquare2, UsersRound } from "lucide-react";

type WorkspaceOverviewProps = {
  total: number;
  tenantLinked: number;
  personal: number;
  tenants: number;
};

export function WorkspaceOverview({
  total,
  tenantLinked,
  personal,
  tenants,
}: WorkspaceOverviewProps) {
  const cards = [
    { label: "Total Workspaces", value: total, icon: Layers3 },
    { label: "Tenant Linked", value: tenantLinked, icon: Building2 },
    { label: "Personal", value: personal, icon: UserSquare2 },
    { label: "Tenants", value: tenants, icon: UsersRound },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {card.value}
            </p>
            <card.icon className="h-4 w-4 text-indigo-400" />
          </div>
        </article>
      ))}
    </section>
  );
}
