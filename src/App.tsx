import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "@/pages/AuthPages/Login";
import RegisterPage from "@/pages/AuthPages/Register";
import VerifyAccountPage from "@/pages/AuthPages/VerifyAccount";
import ForgotPassWordPage from "@/pages/AuthPages/ForgotPassWord";
import NewPasswordPage from "@/pages/AuthPages/NewPassword";
import MfaPage from "@/pages/AuthPages/Mfa";
import DashboardPage from "@/pages/DashboardPages/DashboardPage";
import ProfilePage from "@/pages/ProfilePages/ProfilePage";
import SettingPage from "@/pages/SettingPages/SettingPage";
import ComputingPage from "@/pages/Computing/ComputingPages/ComputingPage";
import NewComputingPage from "@/pages/Computing/NewComputingPages/NewComputingPage";
import WorkspacePage from "@/pages/UserPages/WorkspacePage";
import TenantPage from "@/pages/UserPages/TenantPage";
import UserPage from "@/pages/UserPages/UserPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import PaaSPage from "@/pages/PaaSPages/PaaSPage";
import DBaaSPage from "@/pages/DBaaSPages/DBaaSPage";
import AppLayout from "@/layout/app-layout";
import AuthLayout from "@/layout/auth-layout";
import AuthRedirectLayout from "@/layout/auth-redirect-layout";
import { Toaster } from "@/components/ui/sonner";

import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<AuthRedirectLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassWordPage />} />
          <Route path="/mfa" element={<MfaPage />} />
          <Route
            path="/new_password/:userid/:token"
            element={<NewPasswordPage />}
          />
          <Route
            path="/active_account/:userid/:token"
            element={<VerifyAccountPage />}
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/computing" element={<ComputingPage />} />
            <Route path="/computing/new" element={<NewComputingPage />} />
            <Route path="/paas" element={<PaaSPage />} />
            <Route path="/dbaas" element={<DBaaSPage />} />
            <Route path="/tenants" element={<TenantPage />} />
            <Route path="/workspaces" element={<WorkspacePage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster richColors position="bottom-right" />
    </>
  );
}

export default App;
