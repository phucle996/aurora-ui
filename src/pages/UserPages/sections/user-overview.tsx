import { BadgeCheck, KeyRound, Layers3, ShieldCheck } from "lucide-react";

type UserOverviewProps = {
  totalRoles: number;
  totalPermissions: number;
  globalRoles: number;
  tenantRoles: number;
};

export function UserOverview({
  totalRoles,
  totalPermissions,
  globalRoles,
  tenantRoles,
}: UserOverviewProps) {
  const cards = [
    { label: "Assigned Roles", value: totalRoles, icon: Layers3 },
    { label: "Effective Permissions", value: totalPermissions, icon: ShieldCheck },
    { label: "Global Roles", value: globalRoles, icon: BadgeCheck },
    { label: "Tenant Roles", value: tenantRoles, icon: KeyRound },
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
