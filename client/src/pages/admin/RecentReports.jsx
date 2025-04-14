import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useAdminRecentReports } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  "under-review": <AlertCircle className="h-4 w-4" />,
};

const statusVariants = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  "under-review": "warning",
};

export const RecentReports = () => {
  const { data: reports, isLoading, isError } = useAdminRecentReports();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive p-4 text-destructive">
        Failed to load recent reports
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recent Death Reports</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deceased</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.map((report) => (
              <TableRow key={report._id}>
                <TableCell className="font-medium">
                  {report.deceased.firstName} {report.deceased.lastName}
                </TableCell>
                <TableCell>
                  {report.reporter.firstName} {report.reporter.lastName}
                </TableCell>
                <TableCell>
                  {new Date(report.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariants[report.status]}
                    className="flex items-center gap-1"
                  >
                    {statusIcons[report.status]}
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/reports/${report._id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate("/admin/reports")}
      >
        View All Reports
      </Button>
    </div>
  );
};
