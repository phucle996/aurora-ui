import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BillingStep } from "./sections/billing-step";
import { ProfileStep, type ProfileForm } from "./sections/profile-step";
import { SecurityStep } from "./sections/security-step";
import { SummaryStep } from "./sections/summary-step";
import api, { getErrorMessage, post } from "@/lib/api/api-ums";

type StepKey = "profile" | "security" | "billing" | "summary";

const steps: { key: StepKey; title: string; description: string }[] = [
  {
    key: "profile",
    title: "Profile details",
    description: "Tell us a bit about yourself and your company.",
  },
  {
    key: "security",
    title: "Security setup",
    description: "Protect your account with stronger authentication.",
  },
  {
    key: "billing",
    title: "Billing preferences",
    description: "Add a payment method and billing contact.",
  },
  {
    key: "summary",
    title: "Final checks",
    description: "Review your setup and finish onboarding.",
  },
];

type OnboardingProps = {
  variant?: "page" | "overlay";
  onSkip?: () => void;
  onComplete?: () => void;
};

export default function OnboardingPage({
  variant = "page",
  onSkip,
  onComplete,
}: OnboardingProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileForm>({
    fullName: "",
    company: "",
    referralSource: "",
    phone: "",
    jobFunction: "",
    country: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const activeStep = steps[step];
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  useEffect(() => {
    let mounted = true;
    if (activeStep.key !== "profile") {
      return;
    }
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data } = await api.get<{
          data?: { profile?: Record<string, string | null> };
          profile?: Record<string, string | null>;
        }>("/auth/me");
        const payload = data?.data ?? data;
        const profile = payload?.profile;
        if (!profile || !mounted) return;
        setProfileData({
          fullName: profile.full_name ?? "",
          company: profile.company ?? "",
          referralSource: profile.referral_source ?? "",
          phone: profile.phone ?? "",
          jobFunction: profile.job_function ?? "",
          country: profile.country ?? "",
        });
      } catch (err) {
        if (mounted) {
          toast.error(getErrorMessage(err, "Failed to load profile."));
        }
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [activeStep.key]);

  const goNext = async () => {
    if (activeStep.key === "profile") {
      if (savingProfile) return;

      setSavingProfile(true);
      toast.dismiss();
      try {
        await post("/auth/profile", {
          full_name: profileData.fullName.trim(),
          company: profileData.company.trim(),
          referral_source: profileData.referralSource.trim(),
          phone: profileData.phone.trim(),
          job_function: profileData.jobFunction.trim(),
          country: profileData.country.trim(),
        });
        toast.success("Profile saved.");
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to save profile."));
        setSavingProfile(false);
        return;
      }
      setSavingProfile(false);
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const goBack = () => setStep((prev) => Math.max(prev - 1, 0));
  const handleSkip = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    toast.dismiss();
    try {
      await post("/auth/profile", {
        full_name: "",
        company: "",
        referral_source: "",
        phone: "",
        job_function: "",
        country: "",
      });
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save profile."));
      setSavingProfile(false);
      return;
    }
    setSavingProfile(false);
    if (onSkip) {
      onSkip();
      return;
    }
    navigate("/dashboard");
  };
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
      return;
    }
  };

  const isOverlay = variant === "overlay";

  return (
    <div
      className={
        isOverlay
          ? "fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-slate-950/70 px-6 py-10 text-slate-100 backdrop-blur"
          : "min-h-screen w-full bg-slate-950 px-6 py-10 text-slate-100"
      }
    >
      <div
        className={
          isOverlay
            ? "mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-950/90 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
            : "mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col gap-8"
        }
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Complete a few quick steps to personalize your Aurora experience.
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={handleSkip}
            disabled={savingProfile}
          >
            <span>{savingProfile ? "Saving..." : "Skip"}</span>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          <div
            className={`flex flex-col rounded-2xl p-6 shadow-[0_20px_40px_rgba(8,12,28,0.5)] ${
              activeStep.key === "security" ? "min-h-[80vh]" : ""
            }`}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                {activeStep.title}
              </h2>
              <p className="text-sm text-slate-300">{activeStep.description}</p>
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/10">
                <div
                  className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {activeStep.key === "profile" && (
              <ProfileStep value={profileData} onChange={setProfileData} />
            )}

            {activeStep.key === "security" && <SecurityStep />}

            {activeStep.key === "billing" && <BillingStep />}

            {activeStep.key === "summary" && <SummaryStep />}

            <div className="mt-auto flex items-end justify-between pt-8">
              <Button
                variant="ghost"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={goBack}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  className="rounded-full bg-indigo-500 px-6 text-white hover:bg-indigo-400"
                  onClick={goNext}
                  disabled={
                    savingProfile ||
                    (activeStep.key === "profile" && loadingProfile)
                  }
                >
                  {savingProfile
                    ? "Saving..."
                    : activeStep.key === "profile" && loadingProfile
                      ? "Loading..."
                      : "Continue"}
                </Button>
              ) : (
                <Button
                  className="rounded-full bg-indigo-500 px-6 text-white hover:bg-indigo-400"
                  onClick={handleComplete}
                  asChild={!onComplete}
                >
                  {onComplete ? (
                    <span>Finish setup</span>
                  ) : (
                    <Link to="/dashboard">Finish setup</Link>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
