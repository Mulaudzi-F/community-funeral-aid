import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAdminReports } from "@/hooks/useAdmin";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/admin/report-columns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminReports = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const { data: reports, isLoading, isError } = useAdminReports(statusFilter);

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Failed to load reports</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Death Reports</h1>
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="under-review">Under Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === "pending" && "Pending Approval"}
            {statusFilter === "under-review" && "Under Review"}
            {statusFilter === "approved" && "Approved Reports"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reports}
            searchKey="deceased.name"
          />
        </CardContent>
      </Card>
    </div>
  );
};
