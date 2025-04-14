import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { Toaster } from "@/components/ui/sonner";

// Fetch all beneficiaries for the current user
export const useBeneficiaries = () => {
  return useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const response = await api.get("/users/beneficiaries");
      return response.data.data;
    },
  });
};

// Add a new beneficiary
export const useAddBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (beneficiaryData) => {
      const response = await api.post("/users/beneficiaries", beneficiaryData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      Toaster({
        title: "Beneficiary added",
        description: "The beneficiary has been successfully added.",
        variant: "success",
      });
    },
    onError: (error) => {
      Toaster({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add beneficiary",
        variant: "destructive",
      });
    },
  });
};

// Update a beneficiary
export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...beneficiaryData }) => {
      const response = await api.put(`/beneficiaries/${id}`, beneficiaryData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      Toaster({
        title: "Beneficiary updated",
        description: "The beneficiary has been successfully updated.",
        variant: "success",
      });
    },
    onError: (error) => {
      Toaster({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update beneficiary",
        variant: "destructive",
      });
    },
  });
};

// Delete a beneficiary
export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/beneficiaries/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      Toaster({
        title: "Beneficiary removed",
        description: "The beneficiary has been successfully removed.",
        variant: "success",
      });
    },
    onError: (error) => {
      Toaster({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to remove beneficiary",
        variant: "destructive",
      });
    },
  });
};

// Verify a beneficiary
export const useVerifyBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/beneficiaries/${id}/verify`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      Toaster({
        title: "Beneficiary verified",
        description: "The beneficiary has been successfully verified.",
        variant: "success",
      });
    },
    onError: (error) => {
      Toaster({
        title: "Verification failed",
        description:
          error.response?.data?.message || "Failed to verify beneficiary",
        variant: "destructive",
      });
    },
  });
};
