import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axios";

export const usePayment = (deathReportId) => {
  const mutation = useMutation({
    mutationFn: async () => {
      // Ensure deathReportId is provided
      if (!deathReportId) {
        throw new Error("Death report ID is required to initiate payment.");
      }

      const response = await api.post(`/payments/contribute/${deathReportId}`);
      return response.data.data; // Ensure the API response structure matches this
    },
    onSuccess: (data) => {
      // Redirect to the payment URL
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Payment URL is missing in the response.");
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Could not initiate payment."
      );
    },
  });

  return mutation;
};

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ["paymentHistory"],
    queryFn: async () => {
      const response = await api.get("/payments/history");
      return response.data.data;
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to fetch payment history."
      );
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
