import { useParams } from "react-router-dom";
import { useDeathReport } from "@/hooks/useDeathReports";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  User,
  FileText,
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { VoteSection } from "./VoteSection";
import { useAuth } from "@/contexts/useAuth";

const statusIcons = {
  pending: <Clock className="h-5 w-5" />,
  approved: <CheckCircle2 className="h-5 w-5" />,
  rejected: <XCircle className="h-5 w-5" />,
  "under-review": <AlertCircle className="h-5 w-5" />,
  paid: <Banknote className="h-5 w-5" />,
};

const statusVariants = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  "under-review": "warning",
  paid: "success",
};

export const DeathReportDetails = () => {
  const { id } = useParams();
  const { data: report, isLoading, isError } = useDeathReport(id);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
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
            <p className="text-destructive">Failed to load death report</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link to="/death-reports">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex justify-between items-center flex-1">
          <h1 className="text-3xl font-bold">Death Report Details</h1>
          <Badge
            variant={statusVariants[report.data.status]}
            className="text-sm"
          >
            <div className="flex items-center gap-2">
              {statusIcons[report.status]}
              {report.data.status?.charAt(0).toUpperCase() +
                report.data.status?.slice(1)}
            </div>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Report Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Deceased Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{report.data.deceased?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {new Date(report.data.deceased.dob).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-medium capitalize">
                  {report.data.deceased.relationship}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Address (Street)
                </p>
                <p className="text-sm font-medium text-foreground">
                  {report.data.reporter.address.street}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Bank and Status Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Holder</p>
                <p className="font-medium">
                  {report.data.bankDetails.accountHolder}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-medium">
                  {report.data.bankDetails.accountNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">
                  {report.data.bankDetails.bankName}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Branch Code</p>
                <p className="font-medium">
                  {report.data.bankDetails.branchCode}
                </p>
              </div>
            </CardContent>
          </Card>

          {report.data.status === "paid" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Payout Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      ZAR {report.data.payoutAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date Paid</p>
                    <p className="font-medium">
                      {new Date(report.data.payoutDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Voting Section (only for pending/under-review reports) */}
      {(report.data.status === "pending" ||
        report.data.status === "under-review") && (
        <VoteSection
          reportId={report.data._id}
          currentUser={user}
          votes={report.data.votes}
          status={report.data.status}
        />
      )}

      {/* Admin Actions (only for under-review reports and admin users) */}
      {report.data.status === "under-review" && user?.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="success">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Payout
              </Button>
              <Button variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Reject Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reporter Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Report Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Reported By</p>
              <p className="font-medium">{report.data.reporter.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Report Date</p>
              <p className="font-medium">
                {new Date(report.data.createdAt).toLocaleDateString()}
              </p>
            </div>
            {report.data.deadline && (
              <div>
                <p className="text-sm text-muted-foreground">Voting Deadline</p>
                <p className="font-medium">
                  {new Date(report.data.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
