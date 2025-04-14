import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  register as registerApi,
  login as loginApi,
  getProfile,
  logout as logoutApi,
} from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  // Fetch user profile

  const { isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getProfile,
    onSuccess: (data) => {
      console.log("User fetched successfully:", data);
      setUser(data);
    },
    onError: (error) => {
      console.error("Failed to fetch user:", error);
      setUser(null);
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
      toast.success({
        title: "Registration successful",
        description: "Your account has been created.",
      });
    },
    onError: (error) => {
      toast.success({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      localStorage.removeItem("token");
      setUser(null);
      queryClient.clear();
      toast.success({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
  });

  const value = {
    user,
    isLoading,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isLoading,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isLoading,
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
