import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Banknote,
  User,
  CalendarDays,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useAdminReportReview } from "@/hooks/useAdmin";
const baseURL = import.meta.env.VITE_API_URL;

export function DeathReportReview({ report }) {
  const { register, handleSubmit, reset } = useForm();
  const { mutate: reviewReport, isPending } = useAdminReportReview();

  const onSubmit = (data) => {
    reviewReport({ reportId: report._id, ...data });
    reset();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get badge variant based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "under-review":
        return "warning";
      case "approved":
        return "success";
      case "paid":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Death Report Review
            <Badge variant={getStatusBadge(report.status)}>
              {report.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Verify all details before approving or rejecting this report
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Report Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Deceased Information
                  </Label>
                  <div className="pl-6 space-y-1">
                    <p>
                      <strong>Name:</strong> {report.deceased.firstName}{" "}
                      {report.deceased.lastName}
                    </p>
                    <p>
                      <strong>Relationship:</strong>{" "}
                      {report.deceased.relationship}
                    </p>
                    <p>
                      <strong>Age at Death:</strong>{" "}
                      {calculateAge(new Date(report.deceased.dob))}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Reporter Information
                  </Label>
                  <div className="pl-6 space-y-1">
                    <p>
                      <strong>Name:</strong> {report.reporter.firstName}{" "}
                      {report.reporter.lastName}
                    </p>
                    <p>
                      <strong>Section:</strong> {report.reporter.section.name}
                    </p>
                    <p>
                      <strong>Community:</strong>{" "}
                      {report.reporter.community.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Timeline
                  </Label>
                  <div className="pl-6 space-y-1">
                    <p>
                      <strong>Reported:</strong> {formatDate(report.createdAt)}
                    </p>
                    <p>
                      <strong>Voting Deadline:</strong>{" "}
                      {formatDate(report.deadline)}
                    </p>
                    {report.payoutDate && (
                      <p>
                        <strong>Paid On:</strong>{" "}
                        {formatDate(report.payoutDate)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Financial Details
                  </Label>
                  <div className="pl-6 space-y-1">
                    <p>
                      <strong>Payout Amount:</strong> ZAR{" "}
                      {report.payoutAmount?.toFixed(2) || "Not calculated"}
                    </p>
                    <p>
                      <strong>Bank Account:</strong>{" "}
                      {report.bankDetails.accountHolder}
                    </p>
                    <p>
                      <strong>Account Number:</strong>{" "}
                      {report.bankDetails.accountNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Verification Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8" />
                    <div>
                      <Label>Death Certificate</Label>
                      <p className="text-sm text-muted-foreground">
                        {report.deathCertificate.split("/").pop()}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Death Certificate</DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <div className="h-[80vh]">
                            <iframe
                              src={`${baseURL}/${report.deathCertificate}`}
                              title="Death Certificate"
                              className="w-full h-full"
                              frameBorder="0"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {report.verificationData && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Verification Results</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>
                          <strong>Status:</strong>{" "}
                          {report.verificationData.valid
                            ? "Verified"
                            : "Not Verified"}
                        </p>
                        {report.verificationData.deceasedInfo && (
                          <p>
                            <strong>Name Match:</strong>{" "}
                            {report.verificationData.deceasedInfo.nameMatch
                              ? "Yes"
                              : "No"}
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Voting Results */}
            {report.votes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Section Voting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label>Approvals</Label>
                        <div className="text-2xl font-bold text-success">
                          {report.votes.filter((v) => v.approved).length}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label>Rejections</Label>
                        <div className="text-2xl font-bold text-destructive">
                          {report.votes.filter((v) => !v.approved).length}
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <Label>Votes Cast</Label>
                      <div className="mt-2 space-y-2">
                        {report.votes.map((vote, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span>
                              {vote.voter.firstName} {vote.voter.lastName}
                            </span>
                            <Badge
                              variant={
                                vote.approved ? "success" : "destructive"
                              }
                            >
                              {vote.approved ? "Approved" : "Rejected"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Review Form */}
            {report.status === "under-review" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Decision</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="adminComments">Comments</Label>
                      <Textarea
                        id="adminComments"
                        {...register("adminComments")}
                        placeholder="Add any additional comments or notes..."
                        className="mt-2"
                      />
                    </div>

                    <CardFooter className="flex justify-end gap-4 px-0 pb-0 pt-6">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() =>
                          onSubmit({
                            approved: false,
                            adminComments: "Rejected by admin",
                          })
                        }
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject Report
                      </Button>
                      <Button
                        type="submit"
                        onClick={handleSubmit((data) =>
                          onSubmit({ ...data, approved: true })
                        )}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Approve Report
                      </Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Payout Deadline</Label>
                    <p className={isDeadlinePassed ? "text-destructive" : ""}>
                      {formatDate(report.payoutDeadline)}
                      {isDeadlinePassed && " (Passed)"}
                    </p>
                  </div>
                  <div>
                    <Label>Payout Status</Label>
                    <p>
                      {report.paidAt
                        ? `Paid on ${formatDate(report.paidAt)}`
                        : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Member Contributions</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {report.contributions?.map((contribution, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>
                          {contribution.member.firstName}{" "}
                          {contribution.member.lastName}
                        </span>
                        <Badge
                          variant={
                            contribution.status === "paid"
                              ? "success"
                              : contribution.status === "late"
                              ? "warning"
                              : contribution.status === "missed"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {contribution.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to calculate age
function calculateAge(birthdate) {
  const diff = Date.now() - new Date(birthdate).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
