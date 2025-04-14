import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { useAuth } from "@/contexts/useAuth";

// Fetch the user's section
export const useSection = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["section", user?.section],
    queryFn: async () => {
      if (!user?.section) {
        throw new Error("No section assigned");
      }

      const response = await api.get(`/sections/${user.section._id}`);
      return response.data;
    },
    enabled: !!user?.section, // Only run query if user has a section
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Fetch members of a section
export const useSectionMembers = (sectionId) => {
  return useQuery({
    queryKey: ["sectionMembers", sectionId],
    queryFn: async () => {
      const response = await api.get(`/sections/${sectionId}/members`);
      return response.data;
    },
    enabled: !!sectionId, // Only run query if sectionId is provided
  });
};

// Fetch reports of a section
export const useSectionReports = (sectionId) => {
  return useQuery({
    queryKey: ["sectionReports", sectionId],
    queryFn: async () => {
      const response = await api.get(`/sections/${sectionId}/reports`);
      return response.data;
    },
    enabled: !!sectionId, // Only run query if sectionId is provided
  });
};

// Fetch finances of a section
export const useSectionFinances = (sectionId) => {
  return useQuery({
    queryKey: ["sectionFinances", sectionId],
    queryFn: async () => {
      const response = await api.get(`/sections/${sectionId}/finances`);
      return response.data;
    },
    enabled: !!sectionId, // Only run query if sectionId is provided
  });
};
