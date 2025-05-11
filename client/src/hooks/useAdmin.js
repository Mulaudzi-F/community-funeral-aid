import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { toast } from "sonner";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const response = await api.get("/admin/stats");
      return response.data;
    },
  });
};

export const useAdminReports = (status) => {
  return useQuery({
    queryKey: ["adminReports", status],
    queryFn: async () => {
      const response = await api.get("/admin/death-reports", {
        params: { status },
      });
      return response.data;
    },
  });
};

export const useAdminUsers = (status) => {
  return useQuery({
    queryKey: ["adminUsers", status],
    queryFn: async () => {
      const response = await api.get("/admin/users", {
        params: { status },
      });
      return response.data;
    },
  });
};

export const useAdminRecentReports = () => {
  return useQuery({
    queryKey: ["adminRecentReports"],
    queryFn: async () => {
      const response = await api.get("/admin/recent-reports");
      return response.data;
    },
  });
};

export const useAdminActivity = () => {
  return useQuery({
    queryKey: ["adminActivity"],
    queryFn: async () => {
      const response = await api.get("/admin/activity");
      return response.data;
    },
  });
};

export const usePendingReports = () => {
  return useQuery({
    queryKey: ["adminPendingReports"],
    queryFn: async () => {
      const response = await api.get("admin/death-reports/pending");
      return response.data;
    },
    onError: (error) => {
      console.error("Error fetching pending reports:", error);
    },
  });
};

export const useAdminReportReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, approved, adminComments }) => {
      const response = await api.put(`/death-reports/${reportId}/review`, {
        approved,
        adminComments,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.message("Report reviewed successfully", {
        description: "The death report status has been updated.",
      });
      queryClient.invalidateQueries("adminReports"); // Invalidate admin reports cache
      queryClient.invalidateQueries("deathReports"); // Invalidate death reports cache
    },
    onError: (error) => {
      toast.message("Error reviewing report", {
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
};
