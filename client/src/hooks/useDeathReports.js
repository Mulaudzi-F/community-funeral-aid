import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDeathReport,
  getDeathReports,
  getDeathReportById,
  voteOnDeathReport,
} from "../api/deathReports";
import { toast } from "sonner";

// Fetch a single death report by ID
export const useDeathReport = (id) => {
  return useQuery({
    queryKey: ["deathReport", id],
    queryFn: () => getDeathReportById(id),
    enabled: !!id, // Only fetch if ID is provided
  });
};

// Create a new death report
export const useCreateDeathReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeathReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deathReports"] });

      toast.success("Death Report Created", {
        description: "The death report was submitted successfully.",
      });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error", {
        description:
          error?.response?.data?.message ||
          "An error occurred while creating the report.",
      });
    },
  });
};

// Vote on a death report
export const useVoteOnDeathReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...voteData }) => voteOnDeathReport(id, voteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["deathReport", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["deathReports"] });

      toast.success("Vote Submitted", {
        description: "Your vote has been recorded.",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error?.response?.data?.message ||
          "An error occurred while submitting your vote.",
      });
    },
  });
};
