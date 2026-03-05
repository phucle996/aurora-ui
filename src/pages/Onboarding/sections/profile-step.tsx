import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProfileForm = {
  fullName: string;
  company: string;
  referralSource: string;
  phone: string;
  jobFunction: string;
  country: string;
};

type ProfileStepProps = {
  value: ProfileForm;
  onChange: (next: ProfileForm) => void;
};

export function ProfileStep({ value, onChange }: ProfileStepProps) {
  const update = (patch: Partial<ProfileForm>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="mt-6">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="onboard-fullname">Full name</FieldLabel>
            <Input
              id="onboard-fullname"
              placeholder="Enter your full name"
              className="h-11"
              value={value.fullName}
              onChange={(event) => update({ fullName: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="onboard-company">Company</FieldLabel>
            <Input
              id="onboard-company"
              placeholder="Your company"
              className="h-11"
              value={value.company}
              onChange={(event) => update({ company: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="onboard-referral">
              Bạn biết đến chúng tôi từ đâu?
            </FieldLabel>
            <Select
              value={value.referralSource}
              onValueChange={(val) => update({ referralSource: val })}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Chọn một nguồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Tìm kiếm Google</SelectItem>
                <SelectItem value="social">Mạng xã hội</SelectItem>
                <SelectItem value="friend">Bạn bè/Đồng nghiệp</SelectItem>
                <SelectItem value="event">Sự kiện/Meetup</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="onboard-phone">Phone</FieldLabel>
            <Input
              id="onboard-phone"
              placeholder="(628) 222-5789"
              className="h-11"
              value={value.phone}
              onChange={(event) => update({ phone: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Job function</FieldLabel>
            <Select
              value={value.jobFunction}
              onValueChange={(val) => update({ jobFunction: val })}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">IT / Security</SelectItem>
                <SelectItem value="ops">Operations</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Country</FieldLabel>
            <Select
              value={value.country}
              onValueChange={(val) => update({ country: val })}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="vn">Vietnam</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="kr">Korea</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FieldGroup>
    </div>
  )
}
