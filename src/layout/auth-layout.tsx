import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api/api-ums";

type MeResponse = {
  id: string;
  username: string;
  email: string;
};

export default function AuthLayout() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get<MeResponse>("/auth/me");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 text-slate-600">
        <div className="flex min-h-screen items-center justify-center text-sm">
          Checking session...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
