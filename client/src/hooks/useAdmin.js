import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

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
      const response = await api.get("/admin/reports/recent");
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
