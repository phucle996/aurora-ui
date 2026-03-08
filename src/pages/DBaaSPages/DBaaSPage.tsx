import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Database,
  HardDrive,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import apiUMS from "@/lib/api/api-ums";
import {
  createDbaasInstance,
  deleteDbaasInstance,
  getDbaasInstanceStatus,
  getErrorMessage,
  listDbaasInstances,
  type DbaasInstanceStatus,
} from "@/lib/api/api-dbaas";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MeResponse = {
  data?: {
    id?: string;
  };
  id?: string;
};

type CreateInstanceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    name: string;
    engine: string;
    version: string;
    instance_count: number;
    plan: string;
    storage_gb: number;
    database_name: string;
    username: string;
    password_secret_ref: string;
    domain: string;
  }) => Promise<void>;
  isSubmitting: boolean;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const statusBadgeClass = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "running") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  }
  if (normalized === "provisioning") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300";
  }
  if (normalized === "failed") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300";
  }
  if (normalized === "deleting") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  }
  return "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300";
};

function CreateInstanceDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateInstanceDialogProps) {
  const [name, setName] = useState("");
  const [engine, setEngine] = useState("postgresql");
  const [version, setVersion] = useState("16");
  const [instanceCount, setInstanceCount] = useState("1");
  const [plan, setPlan] = useState("standard");
  const [storageGB, setStorageGB] = useState("20");
  const [databaseName, setDatabaseName] = useState("appdb");
  const [username, setUsername] = useState("appuser");
  const [passwordSecretRef, setPasswordSecretRef] = useState("");
  const [domain, setDomain] = useState("");

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      engine.trim().length > 0 &&
      version.trim().length > 0 &&
      Number(instanceCount) > 0 &&
      Number(storageGB) > 0 &&
      databaseName.trim().length > 0 &&
      username.trim().length > 0 &&
      domain.trim().length > 0
    );
  }, [databaseName, domain, engine, instanceCount, name, storageGB, username, version]);

  const reset = () => {
    setName("");
    setEngine("postgresql");
    setVersion("16");
    setInstanceCount("1");
    setPlan("standard");
    setStorageGB("20");
    setDatabaseName("appdb");
    setUsername("appuser");
    setPasswordSecretRef("");
    setDomain("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isSubmitting) {
          reset();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Provision Database Service</DialogTitle>
          <DialogDescription>
            Create managed database instance via DBaaS module.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="dbaas-name">Instance Name</Label>
              <Input
                id="dbaas-name"
                placeholder="orders-db"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dbaas-engine">Engine</Label>
              <Select value={engine} onValueChange={setEngine}>
                <SelectTrigger id="dbaas-engine">
                  <SelectValue placeholder="Select engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mariadb">MariaDB</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="dbaas-version">Version</Label>
              <Input
                id="dbaas-version"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dbaas-count">Replica Count</Label>
              <Input
                id="dbaas-count"
                type="number"
                min={1}
                value={instanceCount}
                onChange={(event) => setInstanceCount(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dbaas-storage">Storage (GB)</Label>
              <Input
                id="dbaas-storage"
                type="number"
                min={1}
                value={storageGB}
                onChange={(event) => setStorageGB(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="dbaas-plan">Plan</Label>
              <Input
                id="dbaas-plan"
                value={plan}
                onChange={(event) => setPlan(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dbaas-domain">Domain</Label>
              <Input
                id="dbaas-domain"
                placeholder="orders-db.aurora.local"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="dbaas-database">Database Name</Label>
              <Input
                id="dbaas-database"
                value={databaseName}
                onChange={(event) => setDatabaseName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dbaas-username">Username</Label>
              <Input
                id="dbaas-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dbaas-secret">Password Secret Ref</Label>
              <Input
                id="dbaas-secret"
                placeholder="secret://dbaas/orders-db"
                value={passwordSecretRef}
                onChange={(event) => setPasswordSecretRef(event.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || isSubmitting}
            onClick={async () => {
              if (!canSubmit || isSubmitting) return;
              await onSubmit({
                name: name.trim(),
                engine: engine.trim(),
                version: version.trim(),
                instance_count: Number(instanceCount) || 1,
                plan: plan.trim() || "standard",
                storage_gb: Number(storageGB) || 20,
                database_name: databaseName.trim(),
                username: username.trim(),
                password_secret_ref: passwordSecretRef.trim(),
                domain: domain.trim(),
              });
              reset();
            }}
          >
            {isSubmitting ? "Provisioning..." : "Provision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DBaaSPage() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, DbaasInstanceStatus>>({});
  const [deletingID, setDeletingID] = useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await apiUMS.get<MeResponse>("/auth/me");
      return res.data;
    },
  });

  const ownerID = meQuery.data?.data?.id ?? meQuery.data?.id ?? "";

  const instancesQuery = useQuery({
    queryKey: ["dbaas-instances", ownerID],
    enabled: ownerID.trim().length > 0,
    queryFn: async () => listDbaasInstances(ownerID),
  });

  const filteredInstances = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return instancesQuery.data ?? [];
    return (instancesQuery.data ?? []).filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.engine.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        item.endpoint.toLowerCase().includes(keyword)
      );
    });
  }, [instancesQuery.data, searchText]);

  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      engine: string;
      version: string;
      instance_count: number;
      plan: string;
      storage_gb: number;
      database_name: string;
      username: string;
      password_secret_ref: string;
      domain: string;
    }) =>
      createDbaasInstance({
        ...payload,
        owner_id: ownerID,
      }),
    onSuccess: async (instance) => {
      toast.success(`Provision started: ${instance.name}`);
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["dbaas-instances", ownerID] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to provision database"));
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (instanceID: string) => getDbaasInstanceStatus(instanceID),
    onSuccess: (status, instanceID) => {
      setStatusMap((prev) => ({ ...prev, [instanceID]: status }));
      const phase = status.platform_status?.phase || status.instance.status || "unknown";
      toast.success(`Status updated: ${phase}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to fetch instance status"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (instanceID: string) => deleteDbaasInstance(instanceID),
    onSuccess: async () => {
      toast.success("Instance deleted");
      await queryClient.invalidateQueries({ queryKey: ["dbaas-instances", ownerID] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to delete instance"));
    },
    onSettled: () => {
      setDeletingID(null);
    },
  });

  const runningCount = useMemo(
    () =>
      (instancesQuery.data ?? []).filter(
        (item) => item.status.trim().toLowerCase() === "running",
      ).length,
    [instancesQuery.data],
  );

  const totalStorage = useMemo(
    () => (instancesQuery.data ?? []).reduce((sum, item) => sum + item.storage_gb, 0),
    [instancesQuery.data],
  );

  const engineCount = useMemo(() => {
    return new Set((instancesQuery.data ?? []).map((item) => item.engine)).size;
  }, [instancesQuery.data]);

  const errorMessage = instancesQuery.isError
    ? getErrorMessage(instancesQuery.error, "Unable to load DBaaS instances")
    : null;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Platform Services
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          DBaaS Instances
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Provision and manage managed SQL/NoSQL databases for customer workloads.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Instances
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold">{(instancesQuery.data ?? []).length}</p>
            <Database className="h-4 w-4 text-indigo-500" />
          </div>
        </article>
        <article className="rounded-xl border border-slate-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Running
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold">{runningCount}</p>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
        </article>
        <article className="rounded-xl border border-slate-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Engine Variants
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold">{engineCount}</p>
            <HardDrive className="h-4 w-4 text-sky-500" />
          </div>
        </article>
        <article className="rounded-xl border border-slate-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Storage (GB)
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold">{totalStorage}</p>
            <Database className="h-4 w-4 text-violet-500" />
          </div>
        </article>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-10 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 lg:max-w-md dark:border-white/10 dark:bg-slate-900/60">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by name, engine, endpoint, status"
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => instancesQuery.refetch()}
              disabled={instancesQuery.isFetching}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              disabled={ownerID.trim().length === 0}
            >
              Provision Instance
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert
            variant="destructive"
            className="border-rose-300/40 bg-rose-50/70 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
          <Table>
            <TableHeader className="bg-slate-100/70 dark:bg-white/5">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Engine</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Replicas</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[220px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instancesQuery.isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Loading DBaaS instances...
                  </TableCell>
                </TableRow>
              )}
              {!instancesQuery.isLoading && filteredInstances.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No instances found.
                  </TableCell>
                </TableRow>
              )}
              {!instancesQuery.isLoading &&
                filteredInstances.map((instance) => {
                  const runtimePhase =
                    statusMap[instance.id]?.platform_status?.phase || instance.status;
                  return (
                    <TableRow key={instance.id}>
                      <TableCell className="font-medium">{instance.name}</TableCell>
                      <TableCell>{instance.engine}</TableCell>
                      <TableCell>{instance.version || "-"}</TableCell>
                      <TableCell>{instance.instance_count}</TableCell>
                      <TableCell>{instance.storage_gb} GB</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {instance.endpoint || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClass(runtimePhase)}>
                          {runtimePhase || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(instance.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => statusMutation.mutate(instance.id)}
                            disabled={statusMutation.isPending}
                          >
                            Status
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
                            disabled={deletingID === instance.id}
                            onClick={() => {
                              const accepted = window.confirm(
                                `Delete database instance "${instance.name}"?`,
                              );
                              if (!accepted) return;
                              setDeletingID(instance.id);
                              deleteMutation.mutate(instance.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            {deletingID === instance.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </section>

      <CreateInstanceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSubmitting={createMutation.isPending}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
