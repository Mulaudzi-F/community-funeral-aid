import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { useToast } from "@/components/ui/use-toast";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { navigate } from "@/utils/navigation";

export const NotificationHandler = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewDeathReport = (data) => {
      toast({
        title: "New Death Report",
        description: `A new death has been reported in your section: ${data.deceasedName}`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              (window.location.href = `/death-reports/${data.reportId}`)
            }
          >
            View
          </Button>
        ),
      });
      queryClient.invalidateQueries("deathReports");
    };

    const handleNewVote = (data) => {
      toast({
        title: "New Vote",
        description: `${data.voterName} ${
          data.approved ? "approved" : "rejected"
        } your report`,
        variant: data.approved ? "success" : "destructive",
      });
      queryClient.invalidateQueries(["deathReport", data.reportId]);
    };

    const handleBeneficiaryRemoved = (data) => {
      toast({
        title: "Beneficiary Removed",
        description: `${data.beneficiaryName} has been removed as they reached age 25.`,
        variant: "warning",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/beneficiaries")}
          >
            View Beneficiaries
          </Button>
        ),
      });
      queryClient.invalidateQueries("beneficiaries");
    };

    const handleReportApproved = (data) => {
      toast({
        title: "Report Approved",
        description: `The report for ${data.deceasedName} has been approved.`,
        variant: "success",
      });
      queryClient.invalidateQueries("deathReports");
    };

    socket.on("new-death-report", handleNewDeathReport);
    socket.on("new-vote", handleNewVote);
    socket.on("report-approved", handleReportApproved);
    socket.on("beneficiary-removed", handleBeneficiaryRemoved);

    return () => {
      socket.off("new-death-report", handleNewDeathReport);
      socket.off("new-vote", handleNewVote);
      socket.off("report-approved", handleReportApproved);
      socket.off("beneficiary-removed", handleBeneficiaryRemoved);
    };
  }, [socket, user, toast, queryClient, navigate]);

  return null;
};
