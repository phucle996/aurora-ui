import { Building2, FolderKanban, Globe2, UsersRound } from "lucide-react";

type TenantOverviewProps = {
  totalTenants: number;
  totalWorkspaces: number;
  totalUsers: number;
  uniqueDomains: number;
};

export function TenantOverview({
  totalTenants,
  totalWorkspaces,
  totalUsers,
  uniqueDomains,
}: TenantOverviewProps) {
  const cards = [
    { label: "Total Tenants", value: totalTenants, icon: Building2 },
    { label: "Total Workspaces", value: totalWorkspaces, icon: FolderKanban },
    { label: "Users In Tenants", value: totalUsers, icon: UsersRound },
    { label: "Unique Domains", value: uniqueDomains, icon: Globe2 },
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
