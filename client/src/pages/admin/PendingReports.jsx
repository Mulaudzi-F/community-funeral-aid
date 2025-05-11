import { columns } from "./PendingReportColumns";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { usePendingReports } from "@/hooks/useAdmin";
import { DataTable } from "@/features/Data-Table";

export function PendingReports() {
  const { data: reports, isLoading, isError, refetch } = usePendingReports();

  console.log(reports);
  reports?.data.forEach((report) => {
    console.log(report.deceased?.firstName); // Logs each firstName individually
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Pending Reports</h2>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-md border border-destructive p-4">
          <p className="text-destructive">
            Failed to load pending reports. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Pending Reports ({reports.data?.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetch();
            toast.message("Refreshing reports...", {
              description: "Fetching the latest pending reports.",
            });
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reports?.data}
        searchKey={["deceased.firstName", "deceased.lastName"]}
      />
    </div>
  );
}
