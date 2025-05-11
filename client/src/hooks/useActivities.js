// hooks/useActivities.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

// Define a reusable query key
const activitiesQueryKey = ["activities"];
const unreadActivitiesQueryKey = ["activities", "unread"];

export const useActivities = () => {
  return useQuery({
    queryKey: activitiesQueryKey,
    queryFn: async () => {
      const response = await api.get("/activities");
      return response.data;
    },
  });
};

export const useUnreadActivityCount = () => {
  return useQuery({
    queryKey: unreadActivitiesQueryKey,
    queryFn: async () => {
      const response = await api.get("/activities/unread");
      return response.data;
    },
  });
};
