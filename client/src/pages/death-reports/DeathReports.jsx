import { useState } from "react";
import { DeathReportCard } from "./DeathReportCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSectionReports } from "@/hooks/useSections";
import { useAuth } from "@/contexts/useAuth";

export const DeathReports = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();
  const {
    section: { _id: sectionId },
  } = user;
  const { data: reports, isLoading, isError } = useSectionReports(sectionId);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
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
            <p className="text-destructive">Failed to load death reports</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredReports = reports.data?.filter((report) => {
    if (filter === "all") return true;
    return report.status === filter;
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Death Reports</h1>
          <Button onClick={() => navigate("/death-reports/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="under-review">Under Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports?.length > 0 ? (
            filteredReports.map((report) => (
              <DeathReportCard key={report._id} report={report} />
            ))
          ) : (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>No reports found</CardTitle>
              </CardHeader>
              <CardContent>
                <p>There are no death reports matching your filter.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
