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
} from "lucide-react";
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
  const status = statusVariants[report.status] || statusVariants.pending;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {report.deceased?.firstName} {report.deceased?.lastName}
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
          {report.deceased?.relationship}
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
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to={`/death-reports/${report._id}`}>View Details</Link>
        </Button>
        {report.status === "approved" && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
            <PaymentButton
              deathReportId={report._id}
              className="w-full sm:w-auto"
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
