import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import api from "@/lib/api/api-ums";
import { ProfileAvatar } from "./sections/profile-avatar";
import { ProfileDetails } from "./sections/profile-details";
import { AccountDetails } from "./sections/account-details";
import { MfaStatus } from "./sections/mfa-status";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type MeProfile = {
  full_name?: string | null;
  company?: string | null;
  referral_source?: string | null;
  phone?: string | null;
  job_function?: string | null;
  country?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type MeData = {
  id?: string;
  username?: string;
  email?: string;
  status?: string;
  user_level?: string;
  on_boarding?: boolean;
  profile?: MeProfile;
};

type MeResponse = {
  data?: MeData;
} & MeData;

type MethodsResponse = {
  data?: { methods?: string[] };
  methods?: string[];
};

export default function ProfilePage() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get<MeResponse>("/auth/me");
      return res.data;
    },
  });

  const mfaQuery = useQuery({
    queryKey: ["mfa-methods"],
    queryFn: async () => {
      const res = await api.get<MethodsResponse>("/auth/mfa/methods");
      return res.data;
    },
  });

  const payload = useMemo(
    () => meQuery.data?.data ?? meQuery.data,
    [meQuery.data],
  );
  const profile = payload?.profile ?? {};

  const methodsPayload = useMemo(
    () => mfaQuery.data?.data ?? mfaQuery.data,
    [mfaQuery.data],
  );
  const methods = useMemo(() => {
    const raw = methodsPayload?.methods ?? [];
    return raw.map((item) => (item === "totp" ? "authenticator" : item));
  }, [methodsPayload]);

  const displayName = profile.full_name || payload?.email || "";

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-6">
          <ProfileAvatar
            name={displayName}
            avatarUrl={profile.avatar_url}
            onUploaded={() => meQuery.refetch()}
          />
          <AccountDetails
            id={payload?.id}
            email={payload?.email}
            status={payload?.status}
          />
        </div>
        <div className="flex flex-col gap-6 lg:pt-6">
          <ProfileDetails
            fullName={profile.full_name}
            company={profile.company}
            referralSource={profile.referral_source}
            phone={profile.phone}
            jobFunction={profile.job_function}
            country={profile.country}
            bio={profile.bio}
            createdAt={profile.created_at}
            updatedAt={profile.updated_at}
            onUpdated={() => meQuery.refetch()}
          />
          <MfaStatus
            methods={methods}
            isLoading={mfaQuery.isLoading}
            onRefresh={() => mfaQuery.refetch()}
          />
        </div>
      </div>
    </div>
  );
}
