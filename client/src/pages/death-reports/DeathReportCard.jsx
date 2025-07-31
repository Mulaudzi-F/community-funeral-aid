import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  CalendarDays,
  User,
  Banknote,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { PaymentButton } from "../payments/PaymentButton";

const statusVariants = {
  pending: {
    text: "Pending",
    icon: <Clock className="h-4 w-4" />,
    variant: "secondary",
  },
  "under-review": {
    text: "Under Review",
    icon: <AlertCircle className="h-4 w-4" />,
    variant: "warning",
  },
  approved: {
    text: "Approved",
    icon: <CheckCircle2 className="h-4 w-4" />,
    variant: "success",
  },
  paid: {
    text: "Paid",
    icon: <Banknote className="h-4 w-4" />,
    variant: "default",
  },
  rejected: {
    text: "Rejected",
    icon: <XCircle className="h-4 w-4" />,
    variant: "destructive",
  },
};

export const DeathReportCard = ({ report }) => {
  const { user } = useAuth();
  const status = statusVariants[report.status] || statusVariants.pending;
  const now = new Date();
  const payoutDeadline = new Date(report.payoutDeadline);
  const isDeadlinePassed = now > payoutDeadline;
  const isPaid = report.status === "paid";

  // Check if current user has paid their contribution
  const userContribution = report.contributions?.find((c) =>
    c.member.equals(user._id)
  );
  const hasPaid = userContribution?.status === "paid";
  const isLate = userContribution?.status === "late";
  const missedPayment = isDeadlinePassed && !hasPaid && !isPaid;

  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      {/* Missed payment indicator */}
      {missedPayment && (
        <div className="absolute top-2 right-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Missed Payment
          </Badge>
        </div>
      )}

      {/* Late payment indicator */}
      {isLate && (
        <div className="absolute top-2 right-2">
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Late Payment
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {report.deceased.firstName} {report.deceased.lastName}
          </CardTitle>
          <Badge variant={status.variant} className="flex items-center gap-1">
            {status.icon}
            {status.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="mr-2 h-4 w-4" />
          {report.deceased.relationship}
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          {new Date(report.createdAt).toLocaleDateString()}
        </div>

        {report.payoutAmount && (
          <div className="flex items-center text-sm">
            <Banknote className="mr-2 h-4 w-4" />
            <span className="font-medium">
              ZAR {report.payoutAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Payment deadline status */}
        {!isPaid && (
          <div
            className={`flex items-center text-sm ${
              isDeadlinePassed ? "text-destructive" : "text-warning"
            }`}
          >
            <Clock className="mr-2 h-4 w-4" />
            {isDeadlinePassed ? (
              <span>Deadline passed {payoutDeadline.toLocaleDateString()}</span>
            ) : (
              <span>Pay by {payoutDeadline.toLocaleDateString()}</span>
            )}
          </div>
        )}

        {/* User payment status */}
        {userContribution && (
          <div
            className={`flex items-center text-sm ${
              hasPaid
                ? "text-success"
                : isLate
                ? "text-warning"
                : "text-muted-foreground"
            }`}
          >
            {hasPaid ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <AlertCircle className="mr-2 h-4 w-4" />
            )}
            <span>
              {hasPaid
                ? "Paid"
                : isLate
                ? "Payment overdue"
                : "Pending payment"}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/death-reports/${report._id}`}>View Details</Link>
        </Button>

        {!hasPaid && !isPaid && (
          <PaymentButton
            deathReportId={report._id}
            className="w-full sm:w-auto"
          />
        )}
      </CardFooter>
    </Card>
  );
};
