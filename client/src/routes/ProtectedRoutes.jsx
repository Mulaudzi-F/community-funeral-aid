import { useAuth } from "@/contexts/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (
    user &&
    !user.isEmailVerified &&
    !location.pathname.startsWith("/verify-email")
  ) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
};
