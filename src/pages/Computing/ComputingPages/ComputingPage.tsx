import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getErrorMessage,
  listVMs,
  type VmItem as VmAPIItem,
  type VmStatus,
} from "@/lib/api/api-vm";

import { ComputingBreadcrumbSection } from "./sections/ComputingBreadcrumbSection";
import { ComputingErrorSection } from "./sections/ComputingErrorSection";
import { ComputingStatsSection } from "./sections/ComputingStatsSection";
import { ComputingToolbarSection } from "./sections/ComputingToolbarSection";
import { ComputingVmTableSection } from "./sections/ComputingVmTableSection";
import type { VmRow } from "./sections/computing.types";

const normalizeStatus = (value: string | undefined): VmStatus => {
  if (value === "running" || value === "stopped" || value === "provisioning") {
    return value;
  }
  return "error";
};

const normalizeVm = (vm: Partial<VmAPIItem>, index: number): VmRow => ({
  id: vm.id ?? `vm-${index + 1}`,
  name: vm.name ?? `vm-${index + 1}`,
  status: normalizeStatus(vm.status),
  region: vm.region ?? "-",
  image: vm.image ?? "-",
  flavor: vm.flavor ?? vm.flavor_name ?? "-",
  public_ip: vm.public_ip ?? "-",
  private_ip: vm.private_ip ?? "-",
  cpu: Number(vm.cpu ?? 0),
  memory_gb: Number(vm.memory_gb ?? 0),
  disk_gb: Number(vm.disk_gb ?? vm.total_disk_gb ?? 0),
  created_at: vm.created_at ?? "",
});

export default function ComputingPage() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VmStatus>("all");

  const vmListPath =
    import.meta.env.VITE_VM_LIST_PATH?.toString() ?? "/api/v1/vms";
  const ownerUserID =
    import.meta.env.VITE_VM_OWNER_USER_ID?.toString()?.trim() ?? "";

  const vmQuery = useQuery({
    queryKey: ["vm-list", "vm-service", vmListPath, ownerUserID],
    queryFn: async () => {
      const rows = await listVMs(vmListPath, {
        owner_user_id: ownerUserID || undefined,
      });
      return rows.map((vm, index) => normalizeVm(vm, index));
    },
  });

  const filteredRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return (vmQuery.data ?? []).filter((vm) => {
      if (statusFilter !== "all" && vm.status !== statusFilter) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return (
        vm.name.toLowerCase().includes(keyword) ||
        vm.id.toLowerCase().includes(keyword) ||
        vm.image.toLowerCase().includes(keyword) ||
        vm.region.toLowerCase().includes(keyword) ||
        vm.public_ip.toLowerCase().includes(keyword) ||
        vm.private_ip.toLowerCase().includes(keyword)
      );
    });
  }, [vmQuery.data, searchText, statusFilter]);

  const stats = useMemo(() => {
    const list = vmQuery.data ?? [];
    return {
      total: list.length,
      running: list.filter((item) => item.status === "running").length,
      cpu: list.reduce((sum, item) => sum + item.cpu, 0),
      disk: list.reduce((sum, item) => sum + item.disk_gb, 0),
    };
  }, [vmQuery.data]);

  const errorMessage = vmQuery.isError
    ? getErrorMessage(vmQuery.error, "Unable to load your VM list")
    : null;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <ComputingBreadcrumbSection />

      <ComputingStatsSection stats={stats} />

      <section className="rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <ComputingToolbarSection
          searchText={searchText}
          onSearchTextChange={setSearchText}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isRefreshing={vmQuery.isFetching}
          onRefresh={() => vmQuery.refetch()}
        />

        {errorMessage && <ComputingErrorSection message={errorMessage} />}

        <ComputingVmTableSection
          isLoading={vmQuery.isLoading}
          rows={filteredRows}
        />
      </section>
    </div>
  );
}
