import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsSection } from "./sections/general-settings-section";
import { BillingPaymentSection } from "./sections/billing-payment-section";
import { UpdatesChangelogSection } from "./sections/updates-changelog-section";

export default function SettingPage() {
  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-1.5 backdrop-blur dark:border-white/10 dark:bg-slate-950/50"
        >
          <TabsTrigger
            value="general"
            className="rounded-lg px-4 py-2 text-sm after:hidden data-[state=active]:bg-indigo-500/15 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-200"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="rounded-lg px-4 py-2 text-sm after:hidden data-[state=active]:bg-indigo-500/15 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-200"
          >
            Billing & Payment
          </TabsTrigger>
          <TabsTrigger
            value="updates"
            className="rounded-lg px-4 py-2 text-sm after:hidden data-[state=active]:bg-indigo-500/15 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-200"
          >
            Updates & Changelog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsSection />
        </TabsContent>
        <TabsContent value="billing" className="space-y-4">
          <BillingPaymentSection />
        </TabsContent>
        <TabsContent value="updates" className="space-y-4">
          <UpdatesChangelogSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
