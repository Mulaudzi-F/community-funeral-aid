import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

// Fetch dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await api.get("/dashboard");
      return response.data;
    },
  });
};

// Fetch recent activity
export const useRecentActivity = () => {
  return useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      const response = await api.get("/dashboard/activity");
      return response.data;
    },
  });
};

// Fetch upcoming payments
export const useUpcomingPayments = () => {
  return useQuery({
    queryKey: ["upcomingPayments"],
    queryFn: async () => {
      const response = await api.get("/dashboard/payments");
      return response.data;
    },
  });
};
