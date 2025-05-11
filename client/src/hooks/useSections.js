import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";

export const useCommunitySection = (communityId, options = {}) => {
  return useQuery({
    queryKey: ["sections", communityId], // Object-based signature
    queryFn: async () => {
      const response = await api.get(`/communities/${communityId}/sections`);
      return response.data;
    },
    enabled: !!communityId, // Only fetch if communityId is provided
    ...options, // Spread additional options
  });
};

export const useSection = (sectionId) => {
  return useQuery({
    queryKey: ["section", sectionId],
    queryFn: async () => {
      const response = await api.get(`/sections/${sectionId}`);
      return response.data;
    },
    enabled: !!sectionId, // Only run query if sectionId is provided
  });
};

// Fetch members of a section
/*export const useSectionMembers = (sectionId) => {
  return useQuery({
    queryKey: ["sectionMembers", sectionId],
    queryFn: async () => {
      const response = await api.get(`/sections/${sectionId}/members`);
      return response.data;
    },
    enabled: !!sectionId, // Only run query if sectionId is provided
  });
};*/

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

export const useCreateSection = (communityId, onSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const response = await api.post(`/sections/${communityId}`, values);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Section created", {
        description: "The new section has been added to your community.",
      });

      queryClient.invalidateQueries(["sections", communityId]);
      queryClient.invalidateQueries(["communities"]);

      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error("Error creating section", {
        description:
          error.response?.data?.message ||
          "An error occurred while creating the section.",
      });
    },
  });
};
