import { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage, post } from "@/lib/api/api-ums";

type ProfileDetailsProps = {
  fullName?: string | null;
  company?: string | null;
  referralSource?: string | null;
  phone?: string | null;
  jobFunction?: string | null;
  country?: string | null;
  bio?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  onUpdated?: () => void;
};

const formatValue = (value?: string | null) =>
  value && value.trim() ? value : "—";

export function ProfileDetails({
  fullName,
  company,
  referralSource,
  phone,
  jobFunction,
  country,
  bio,
  createdAt,
  updatedAt,
  onUpdated,
}: ProfileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: fullName ?? "",
    company: company ?? "",
    referralSource: referralSource ?? "",
    phone: phone ?? "",
    jobFunction: jobFunction ?? "",
    country: country ?? "",
    bio: bio ?? "",
  });

  useEffect(() => {
    if (isEditing) return;
    setForm({
      fullName: fullName ?? "",
      company: company ?? "",
      referralSource: referralSource ?? "",
      phone: phone ?? "",
      jobFunction: jobFunction ?? "",
      country: country ?? "",
      bio: bio ?? "",
    });
  }, [
    fullName,
    company,
    referralSource,
    phone,
    jobFunction,
    country,
    bio,
    isEditing,
  ]);

  const update = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await post("/auth/profile", {
        full_name: form.fullName.trim(),
        company: form.company.trim(),
        referral_source: form.referralSource.trim(),
        phone: form.phone.trim(),
        job_function: form.jobFunction.trim(),
        country: form.country.trim(),
        bio: form.bio.trim(),
      });
      toast.success("Profile updated");
      setIsEditing(false);
      onUpdated?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      fullName: fullName ?? "",
      company: company ?? "",
      referralSource: referralSource ?? "",
      phone: phone ?? "",
      jobFunction: jobFunction ?? "",
      country: country ?? "",
      bio: bio ?? "",
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Profile details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal and company information
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-slate-200"
            aria-label="Edit profile"
            title="Edit profile"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          {updatedAt
            ? `Updated ${new Date(updatedAt).toLocaleDateString()}`
            : ""}
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-400/40 dark:text-indigo-200 dark:hover:bg-indigo-500/10"
                disabled={saving}
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Full name
          </p>
          {isEditing ? (
            <Input
              value={form.fullName}
              onChange={(event) => update({ fullName: event.target.value })}
              className="mt-1 h-10"
              placeholder="Full name"
            />
          ) : (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {formatValue(fullName)}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Company
          </p>
          {isEditing ? (
            <Input
              value={form.company}
              onChange={(event) => update({ company: event.target.value })}
              className="mt-1 h-10"
              placeholder="Company"
            />
          ) : (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {formatValue(company)}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Referral source
          </p>
          {isEditing ? (
            <Input
              value={form.referralSource}
              onChange={(event) =>
                update({ referralSource: event.target.value })
              }
              className="mt-1 h-10"
              placeholder="Referral source"
            />
          ) : (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {formatValue(referralSource)}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Phone
          </p>
          {isEditing ? (
            <Input
              value={form.phone}
              onChange={(event) => update({ phone: event.target.value })}
              className="mt-1 h-10"
              placeholder="Phone"
            />
          ) : (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {formatValue(phone)}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Job function
          </p>
          {isEditing ? (
            <Input
              value={form.jobFunction}
              onChange={(event) => update({ jobFunction: event.target.value })}
              className="mt-1 h-10"
              placeholder="Job function"
            />
          ) : (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {formatValue(jobFunction)}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Country
          </p>
          {isEditing ? (
            <Input
              value={form.country}
              onChange={(event) => update({ country: event.target.value })}
              className="mt-1 h-10"
              placeholder="Country"
            />
          ) : (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {formatValue(country)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Bio</p>
        {isEditing ? (
          <Textarea
            value={form.bio}
            onChange={(event) => update({ bio: event.target.value })}
            className="mt-1 min-h-20"
            placeholder="Short bio"
          />
        ) : bio ? (
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
            {bio}
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">—</p>
        )}
      </div>

      {createdAt ? (
        <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">
          Created {new Date(createdAt).toLocaleDateString()}
        </p>
      ) : null}
    </section>
  );
}
