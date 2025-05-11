import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { CalendarDays, User } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const statusVariants = {
  pending: { text: "Pending", variant: "secondary" },
  "under-review": { text: "Under Review", variant: "warning" },
  approved: { text: "Approved", variant: "success" },
  paid: { text: "Paid", variant: "default" },
  rejected: { text: "Rejected", variant: "destructive" },
};

export const SectionReports = ({ reports = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Death Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No death reports in this section
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deceased</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report) => (
                <TableRow key={report._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {report.deceased?.firstName} {report.deceased?.lastName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.reporter.firstName} {report.reporter.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {format(new Date(report.createdAt), "PP")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[report.status].variant}>
                      {statusVariants[report.status].text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/death-reports/${report._id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export const SectionReportsSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
