import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Banknote, CheckCircle2, XCircle, Clock } from "lucide-react";
import { usePaymentHistory } from "@/hooks/usePayment";

const statusIcons = {
  completed: <CheckCircle2 className="h-4 w-4 text-success" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  pending: <Clock className="h-4 w-4 text-warning" />,
  cancelled: <XCircle className="h-4 w-4 text-muted-foreground" />,
};

export function PaymentHistory() {
  const { data: payments, isLoading, isError } = usePaymentHistory();
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load payment history</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments?.length > 0 ? (
          payments.map((payment) => (
            <TableRow key={payment._id}>
              <TableCell>
                {format(new Date(payment.createdAt), "PPpp")}
              </TableCell>
              <TableCell>
                {payment.deathReport?.deceased?.firstName}{" "}
                {payment.deathReport?.deceased?.lastName}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  ZAR {payment.amount.toFixed(2)}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    payment.status === "completed"
                      ? "success"
                      : payment.status === "failed"
                      ? "destructive"
                      : payment.status === "pending"
                      ? "warning"
                      : "outline"
                  }
                  className="flex items-center gap-2"
                >
                  {statusIcons[payment.status]}
                  {payment.status.charAt(0).toUpperCase() +
                    payment.status.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center h-24">
              No payments found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
