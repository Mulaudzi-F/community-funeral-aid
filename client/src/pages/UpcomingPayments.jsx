import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpcomingPayments } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, Banknote, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PaymentButton } from "./payments/PaymentButton";

export const UpcomingPayments = () => {
  const { data: reports, isLoading, isError } = useUpcomingPayments();

  console.log("Upcoming Payments", reports);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load upcoming payments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Upcoming Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports?.data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming payments at this time
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deceased</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.data.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>
                    <div className="font-medium">
                      {report.deceased.firstName} {report.deceased.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {report.deceased.relationship}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {report.reporter.firstName} {report.reporter.lastName}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ZAR {report.payoutAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(report.payoutDeadline), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PaymentButton deathReportId={report._id}></PaymentButton>
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
