import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function BillingStep() {
  return (
    <div className="mt-6 space-y-6">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>Billing email *</FieldLabel>
            <Input type="email" placeholder="billing@company.com" className="h-11" />
          </Field>
          <Field>
            <FieldLabel>Plan *</FieldLabel>
            <Select>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field>
          <FieldLabel>Payment method *</FieldLabel>
          <Select>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Credit card</SelectItem>
              <SelectItem value="bank">Bank transfer</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p>
          Add a payment method now to activate billing and unlock usage based plans.
          You can update this later in settings.
        </p>
      </div>
    </div>
  )
}
