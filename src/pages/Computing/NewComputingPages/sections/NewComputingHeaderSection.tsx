import { Link } from "react-router-dom";
import { ChevronLeft, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Props = {
  onCreate: () => void;
};

export function NewComputingHeaderSection({ onCreate }: Props) {
  return (
    <section className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/computing">Computing</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New VM</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 tracking-wide">
            NEW DEPLOYMENT
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Create Virtual Machine</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Define compute profile, network, and access policy before provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/computing">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button onClick={onCreate}>
            <Rocket className="h-4 w-4" />
            Create VM
          </Button>
        </div>
      </div>
    </section>
  );
}
