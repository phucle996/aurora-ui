import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CloudUpload,
  GitBranch,
  Rocket,
  Search,
  Server,
} from "lucide-react";
import { toast } from "sonner";

import apiUMS from "@/lib/api/api-ums";
import {
  createPaasApp,
  createPaasRelease,
  deployPaasRelease,
  getErrorMessage,
  getPaasAppStatus,
  listPaasApps,
  listPaasBuilds,
  triggerPaasBuild,
  type PaasApp,
  type PaasAppStatus,
  type PaasBuild,
} from "@/lib/api/api-paas";
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

type CreateAppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    name: string;
    git_repository: string;
    default_branch: string;
    runtime: string;
  }) => Promise<void>;
  isSubmitting: boolean;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const normalizeBuildStatus = (status: string) => {
  const lower = status.trim().toLowerCase();
  if (lower === "success") return "success";
  if (lower === "running") return "running";
  if (lower === "pending") return "pending";
  if (lower === "failed") return "failed";
  return "unknown";
};

const buildStatusBadgeClass = (status: string) => {
  switch (normalizeBuildStatus(status)) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "running":
      return "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300";
    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
    case "failed":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300";
  }
};

function CreateAppDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateAppDialogProps) {
  const [name, setName] = useState("");
  const [gitRepository, setGitRepository] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [runtime, setRuntime] = useState("dockerfile");

  const canSubmit = useMemo(
    () => name.trim().length > 0 && gitRepository.trim().length > 0,
    [gitRepository, name],
  );

  const reset = () => {
    setName("");
    setGitRepository("");
    setDefaultBranch("main");
    setRuntime("dockerfile");
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create PaaS Application</DialogTitle>
          <DialogDescription>
            Register source repository so Aurora can build and deploy it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="paas-app-name">App Name</Label>
            <Input
              id="paas-app-name"
              placeholder="billing-api"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="paas-app-repo">Git Repository URL</Label>
            <Input
              id="paas-app-repo"
              placeholder="https://github.com/org/repo.git"
              value={gitRepository}
              onChange={(event) => setGitRepository(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="paas-app-branch">Default Branch</Label>
              <Input
                id="paas-app-branch"
                placeholder="main"
                value={defaultBranch}
                onChange={(event) => setDefaultBranch(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paas-app-runtime">Runtime</Label>
              <Input
                id="paas-app-runtime"
                placeholder="dockerfile | node | go | python"
                value={runtime}
                onChange={(event) => setRuntime(event.target.value)}
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
            onClick={async () => {
              if (!canSubmit || isSubmitting) return;
              await onSubmit({
                name: name.trim(),
                git_repository: gitRepository.trim(),
                default_branch: defaultBranch.trim() || "main",
                runtime: runtime.trim() || "dockerfile",
              });
              reset();
            }}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create App"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PaaSPage() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [activeAppID, setActiveAppID] = useState("");
  const [appStatuses, setAppStatuses] = useState<Record<string, PaasAppStatus>>(
    {},
  );
  const [buildActionID, setBuildActionID] = useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await apiUMS.get<MeResponse>("/auth/me");
      return res.data;
    },
  });

  const ownerID = meQuery.data?.data?.id ?? meQuery.data?.id ?? "";

  const appsQuery = useQuery({
    queryKey: ["paas-apps", ownerID],
    enabled: ownerID.trim().length > 0,
    queryFn: async () => listPaasApps(ownerID),
  });

  const filteredApps = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return appsQuery.data ?? [];
    return (appsQuery.data ?? []).filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.git_repository.toLowerCase().includes(keyword) ||
        item.runtime.toLowerCase().includes(keyword)
      );
    });
  }, [appsQuery.data, searchText]);

  const focusedAppID = useMemo(() => {
    if (
      activeAppID &&
      (appsQuery.data ?? []).some((item) => item.id === activeAppID)
    ) {
      return activeAppID;
    }
    return filteredApps[0]?.id ?? "";
  }, [activeAppID, appsQuery.data, filteredApps]);

  const focusedApp = useMemo(
    () => (appsQuery.data ?? []).find((item) => item.id === focusedAppID) ?? null,
    [appsQuery.data, focusedAppID],
  );

  const buildsQuery = useQuery({
    queryKey: ["paas-builds", focusedAppID],
    enabled: focusedAppID.length > 0,
    queryFn: async () => listPaasBuilds(focusedAppID),
  });

  const createAppMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      git_repository: string;
      default_branch: string;
      runtime: string;
    }) => {
      await createPaasApp({
        ...payload,
        owner_id: ownerID,
      });
    },
    onSuccess: async () => {
      toast.success("PaaS app created");
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["paas-apps", ownerID] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to create app"));
    },
  });

  const triggerBuildMutation = useMutation({
    mutationFn: async (appID: string) => triggerPaasBuild(appID),
    onSuccess: async (_, appID) => {
      toast.success("Build triggered");
      setActiveAppID(appID);
      await queryClient.invalidateQueries({ queryKey: ["paas-builds", appID] });
      await queryClient.invalidateQueries({ queryKey: ["paas-apps", ownerID] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to trigger build"));
    },
  });

  const checkStatusMutation = useMutation({
    mutationFn: async (appID: string) => getPaasAppStatus(appID),
    onSuccess: (status, appID) => {
      setAppStatuses((prev) => ({ ...prev, [appID]: status }));
      toast.success(`Status updated: ${status.status || "unknown"}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to load app status"));
    },
  });

  const releaseAndDeployMutation = useMutation({
    mutationFn: async (payload: {
      build: PaasBuild;
      domain: string;
      app: PaasApp;
    }) => {
      const release = await createPaasRelease(payload.build.id);
      const deployment = await deployPaasRelease(release.id, {
        domain: payload.domain,
      });
      return { deployment, appID: payload.app.id };
    },
    onSuccess: async ({ deployment, appID }) => {
      toast.success(`Deployed: ${deployment.domain || deployment.namespace}`);
      await queryClient.invalidateQueries({ queryKey: ["paas-builds", appID] });
      const status = await getPaasAppStatus(appID);
      setAppStatuses((prev) => ({ ...prev, [appID]: status }));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Release/deploy failed"));
    },
    onSettled: () => {
      setBuildActionID(null);
    },
  });

  const runningBuilds = useMemo(
    () =>
      (buildsQuery.data ?? []).filter(
        (item) => normalizeBuildStatus(item.status) === "running",
      ).length,
    [buildsQuery.data],
  );

  const successfulBuilds = useMemo(
    () =>
      (buildsQuery.data ?? []).filter(
        (item) => normalizeBuildStatus(item.status) === "success",
      ).length,
    [buildsQuery.data],
  );

  const errorMessage = appsQuery.isError
    ? getErrorMessage(appsQuery.error, "Unable to load PaaS apps")
    : null;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Platform Services
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          PaaS Applications
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Build and deploy customer applications from source repository.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Apps
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold">{(appsQuery.data ?? []).length}</p>
            <Server className="h-4 w-4 text-indigo-500" />
          </div>
        </article>
        <article className="rounded-xl border border-slate-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Running Builds
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold">{runningBuilds}</p>
            <CloudUpload className="h-4 w-4 text-sky-500" />
          </div>
        </article>
        <article className="rounded-xl border border-slate-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Successful Builds
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold">{successfulBuilds}</p>
            <Rocket className="h-4 w-4 text-emerald-500" />
          </div>
        </article>
        <article className="rounded-xl border border-slate-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Focused App Status
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold">
              {focusedAppID && appStatuses[focusedAppID]
                ? appStatuses[focusedAppID].status
                : "n/a"}
            </p>
            <GitBranch className="h-4 w-4 text-violet-500" />
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
              placeholder="Search app by name, runtime, repository"
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => appsQuery.refetch()}
              disabled={appsQuery.isFetching}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              disabled={ownerID.trim().length === 0}
            >
              Create App
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
                <TableHead>Application</TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Default Branch</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[280px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appsQuery.isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Loading PaaS apps...
                  </TableCell>
                </TableRow>
              )}
              {!appsQuery.isLoading && filteredApps.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No application found.
                  </TableCell>
                </TableRow>
              )}
              {!appsQuery.isLoading &&
                filteredApps.map((app) => (
                  <TableRow
                    key={app.id}
                    className={focusedAppID === app.id ? "bg-indigo-500/5" : ""}
                  >
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell>{app.runtime || "-"}</TableCell>
                    <TableCell>{app.default_branch || "-"}</TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {app.git_repository}
                    </TableCell>
                    <TableCell>{formatDateTime(app.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveAppID(app.id);
                            checkStatusMutation.mutate(app.id);
                          }}
                          disabled={checkStatusMutation.isPending}
                        >
                          Status
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveAppID(app.id);
                            triggerBuildMutation.mutate(app.id);
                          }}
                          disabled={triggerBuildMutation.isPending}
                        >
                          Build
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Build Pipeline {focusedApp ? `- ${focusedApp.name}` : ""}
          </h2>
          {focusedAppID && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => buildsQuery.refetch()}
              disabled={buildsQuery.isFetching}
            >
              Refresh Builds
            </Button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
          <Table>
            <TableHeader className="bg-slate-100/70 dark:bg-white/5">
              <TableRow>
                <TableHead>Build ID</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Finished</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {focusedAppID.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Select an app to view builds.
                  </TableCell>
                </TableRow>
              )}
              {focusedAppID.length > 0 && buildsQuery.isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Loading builds...
                  </TableCell>
                </TableRow>
              )}
              {focusedAppID.length > 0 &&
                !buildsQuery.isLoading &&
                (buildsQuery.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No builds yet.
                    </TableCell>
                  </TableRow>
                )}
              {focusedAppID.length > 0 &&
                !buildsQuery.isLoading &&
                (buildsQuery.data ?? []).map((build) => {
                  const success = normalizeBuildStatus(build.status) === "success";
                  const canDeploy =
                    success && focusedApp && buildActionID !== build.id;
                  return (
                    <TableRow key={build.id}>
                      <TableCell className="font-mono text-xs">{build.id}</TableCell>
                      <TableCell>{build.branch || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={buildStatusBadgeClass(build.status)}
                        >
                          {build.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        {build.image_tag || "-"}
                      </TableCell>
                      <TableCell>{formatDateTime(build.started_at)}</TableCell>
                      <TableCell>{formatDateTime(build.finished_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!canDeploy}
                            onClick={() => {
                              if (!focusedApp) return;
                              const suggestedDomain = `${focusedApp.name}.aurora.local`;
                              const input = window.prompt(
                                "Enter public domain for this release:",
                                suggestedDomain,
                              );
                              if (!input) return;
                              const domain = input.trim();
                              if (domain.length === 0) {
                                toast.error("Domain is required");
                                return;
                              }
                              setBuildActionID(build.id);
                              releaseAndDeployMutation.mutate({
                                build,
                                app: focusedApp,
                                domain,
                              });
                            }}
                          >
                            {buildActionID === build.id
                              ? "Deploying..."
                              : "Release & Deploy"}
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

      <CreateAppDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSubmitting={createAppMutation.isPending}
        onSubmit={async (payload) => {
          await createAppMutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
