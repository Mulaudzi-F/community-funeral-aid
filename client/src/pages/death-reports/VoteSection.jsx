import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useVoteOnDeathReport } from "@/hooks/useDeathReports";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const VoteSection = ({ reportId, currentUser, votes, status }) => {
  // const { toast } = useToast();
  const { mutate: vote, isLoading } = useVoteOnDeathReport();

  // Check if current user has already voted
  const userVote = votes.find((vote) => vote.voter._id === currentUser._id);
  const approvalCount = votes.filter((vote) => vote.approved).length;

  const handleVote = (approved) => {
    vote(
      { id: reportId, approved },
      {
        onSuccess: () => {
          Toaster({
            title: "Vote submitted",
            description: `You ${
              approved ? "approved" : "rejected"
            } this report.`,
          });
        },
        onError: (error) => {
          Toaster({
            title: "Vote failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            {status === "pending" ? "Section Voting" : "Admin Review"}
          </CardTitle>
          <Badge variant="secondary">{approvalCount} / 10 Approvals</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {userVote ? (
          <div className="flex items-center gap-2">
            <p className="font-medium">
              You voted {userVote.approved ? "to approve" : "to reject"} this
              report.
            </p>
            {userVote.comment && (
              <p className="text-sm text-muted-foreground">
                "{userVote.comment}"
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">
              {status === "pending"
                ? "As a member of this section, please review and vote on this report."
                : "As an admin, please review this report before approval."}
            </p>
            <div className="flex gap-4">
              <Button
                variant="success"
                onClick={() => handleVote(true)}
                disabled={isLoading}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleVote(false)}
                disabled={isLoading}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
