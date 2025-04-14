import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDeathReport,
  getDeathReports,
  getDeathReportById,
  voteOnDeathReport,
} from "../api/deathReports";

// Fetch all death reports
export const useDeathReports = () => {
  return useQuery({
    queryKey: ["deathReports"],
    queryFn: getDeathReports,
  });
};

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
    },
    onError: (error) => {
      console.error("Error creating death report:", error);
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
    },
    onError: (error) => {
      console.error("Error voting on death report:", error);
    },
  });
};
