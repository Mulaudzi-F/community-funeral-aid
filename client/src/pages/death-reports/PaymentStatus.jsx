import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, AlertTriangle } from "lucide-react";

export function PaymentStatus({ report, userId }) {
  const now = new Date();
  const payoutDeadline = new Date(report.payoutDeadline);
  const isDeadlinePassed = now > payoutDeadline;
  const isPaid = report.status === "paid";

  const userContribution = report.contributions?.find((c) =>
    c.member.equals(userId)
  );
  const hasPaid = userContribution?.status === "paid";
  const isLate = userContribution?.status === "late";
  const missedPayment = isDeadlinePassed && !hasPaid && !isPaid;

  if (isPaid) {
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Payout completed
      </Badge>
    );
  }

  if (missedPayment) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Missed payment
      </Badge>
    );
  }

  if (isLate) {
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Late payment
      </Badge>
    );
  }

  if (hasPaid) {
    return (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Paid
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      Pending payment
    </Badge>
  );
}
