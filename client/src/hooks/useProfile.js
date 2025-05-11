import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { toast } from "sonner";

const USER_QUERY_KEY = ["user"];

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put("/users/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      toast.success("Profile updated", {
        description: "Your profile was successfully updated.",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error?.response?.data?.message || "Failed to update profile.",
      });
    },
  });
};

// Change user password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => api.put("/users/change-password", data),
    onSuccess: () => {
      toast.success("Password changed", {
        description: "Your password was successfully changed.",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error?.response?.data?.message || "Failed to change password.",
      });
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put("/users/notification-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
};
