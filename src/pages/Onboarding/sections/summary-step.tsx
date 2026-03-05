import { CreditCard, ShieldCheck, UserRound } from "lucide-react"

export function SummaryStep() {
  return (
    <div className="mt-6 space-y-5 text-sm text-slate-300">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
          <UserRound className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Profile completeness</p>
          <p className="mt-1 text-xs text-slate-300">
            Completing your profile helps us tailor security and analytics for your
            organization.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            Recommended: Enable 2FA
          </p>
          <p className="mt-1 text-xs text-slate-300">
            2FA reduces account takeover risk by 98%. We can help you set it up in
            minutes.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-200">
          <CreditCard className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Billing reminders</p>
          <p className="mt-1 text-xs text-slate-300">
            Add a payment method now to avoid service interruptions once you move out
            of trial.
          </p>
        </div>
      </div>
    </div>
  )
}
