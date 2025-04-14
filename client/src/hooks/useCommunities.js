import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { Toaster } from "@/components/ui/sonner";

// Fetch all communities
export const useCommunities = () => {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const response = await api.get("/communities");
      return response.data;
    },
  });
};

// Fetch a single community by ID
export const useCommunity = (id) => {
  return useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      const response = await api.get(`/communities/${id}`);
      return response.data;
    },
    enabled: !!id, // Only fetch if ID is provided
  });
};

// Create a new community
export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityData) => {
      const response = await api.post("/communities", communityData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      Toaster({
        title: "Community created",
        description: "The new community has been successfully created.",
        variant: "success",
      });
    },
    onError: (error) => {
      Toaster({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create community",
        variant: "destructive",
      });
    },
  });
};

// Update an existing community
export const useUpdateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...communityData }) => {
      const response = await api.put(`/communities/${id}`, communityData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      Toaster({
        title: "Community updated",
        description: "The community has been successfully updated.",
        variant: "success",
      });
    },
    onError: (error) => {
      Toaster({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update community",
        variant: "destructive",
      });
    },
  });
};

// Fetch sections of a specific community
export const useCommunitySections = (communityId) => {
  return useQuery({
    queryKey: ["communitySections", communityId],
    queryFn: async () => {
      const response = await api.get(`/communities/${communityId}/sections`);
      return response.data;
    },
    enabled: !!communityId, // Only fetch if communityId is provided
  });
};

// Join a community
export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, sectionId }) => {
      const response = await api.post("/users/join-community", {
        communityId,
        sectionId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      Toaster({
        title: "Success",
        description: "You have successfully joined the community.",
        variant: "success",
      });
    },
    onError: (error) => {
      Toaster({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to join community",
        variant: "destructive",
      });
    },
  });
};
