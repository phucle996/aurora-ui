import {
  CalendarClock,
  CreditCard,
  Download,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const invoices = [
  { id: "INV-1021", date: "2026-02-01", amount: "$149.00", status: "Paid" },
  { id: "INV-1012", date: "2026-01-01", amount: "$149.00", status: "Paid" },
  { id: "INV-1003", date: "2025-12-01", amount: "$149.00", status: "Paid" },
];

export function BillingPaymentSection() {
  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <Card className="border-slate-200/70 bg-white/80 shadow-none backdrop-blur xl:col-span-7 dark:border-white/10 dark:bg-slate-950/60">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <WalletCards className="h-4 w-4 text-indigo-500" />
            Current plan
          </CardTitle>
          <CardDescription>
            Track usage and upgrade before hitting limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/70 p-4 dark:border-indigo-400/30 dark:bg-indigo-500/10">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Plan</p>
                <p className="text-xl font-semibold">Pro Team</p>
              </div>
              <Badge className="bg-emerald-600 text-white">Active</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Renewal date: Mar 01, 2026
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Members</span>
                  <span>42 / 60</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>API requests</span>
                  <span>1.8M / 3.0M</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" className="bg-indigo-500 hover:bg-indigo-400">
              Upgrade plan
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-300/80 dark:border-white/15"
            >
              Compare plans
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80 shadow-none backdrop-blur xl:col-span-5 dark:border-white/10 dark:bg-slate-950/60">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-cyan-500" />
            Payment methods
          </CardTitle>
          <CardDescription>
            Manage cards and fallback payment options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-slate-200/80 p-3 dark:border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Visa •••• 8492</p>
              <Badge variant="secondary">Default</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Expires 10/2028
            </p>
          </div>
          <div className="rounded-lg border border-slate-200/80 p-3 dark:border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Mastercard •••• 2310</p>
              <Badge variant="outline">Backup</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Expires 04/2027
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-300/80 dark:border-white/15"
          >
            Add payment method
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80 shadow-none backdrop-blur xl:col-span-12 dark:border-white/10 dark:bg-slate-950/60">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <ReceiptText className="h-4 w-4 text-amber-500" />
            Invoices
          </CardTitle>
          <CardDescription>
            Download payment history and reconcile accounting records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {invoices.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200/80 px-3 py-2 dark:border-white/10"
            >
              <div className="flex items-center gap-3">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">{item.id}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{item.amount}</span>
                <Badge variant="secondary">{item.status}</Badge>
                <Button type="button" size="icon" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
