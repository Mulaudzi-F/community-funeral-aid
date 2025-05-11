import { createContext, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  register as registerApi,
  login as loginApi,
  getProfile,
  logout as logoutApi,
} from "../api/auth";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  // Fetch user profile
  const { isLoading, data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getProfile,
    onSuccess: (data) => {
      console.log("User fetched successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("token"); // Clear token if invalid
    },
    retry: false,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Registration successful. Your account has been created.");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong."
      );
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Login successful. Welcome back!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Invalid credentials."
      );
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      localStorage.removeItem("token");
      queryClient.clear();
      toast.success("Logged out. You have been successfully logged out.");
    },
  });

  // Verify Email Mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (token) => api.get(`/auth/verify-email?token=${token}`),
    onSuccess: () => {
      toast.success(
        "Email verified. Your email has been successfully verified."
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Invalid or expired token.");
    },
  });

  // Resend Verification Email Mutation
  const resendVerificationEmailMutation = useMutation({
    mutationFn: () => api.post("/auth/send-verification"),
    onSuccess: () => {
      toast.success(
        "Verification email sent. Check your inbox for the verification link."
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Please try again later.");
    },
  });

  const value = {
    user,
    isLoading,
    isRegistering: registerMutation.isPending,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isLoading,
    verifyEmail: verifyEmailMutation.mutateAsync,
    resendVerificationEmail: resendVerificationEmailMutation.mutateAsync,
    isResendingVerificationEmail: resendVerificationEmailMutation.isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
