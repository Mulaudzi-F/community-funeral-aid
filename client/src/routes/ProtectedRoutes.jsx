import { useAuth } from "@/contexts/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const ProtectedRoute = () => {
  const { user, isLoading, registrationInProgress } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (registrationInProgress) {
    return <div>Completing registration...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (
    user &&
    !user.isEmailVerified &&
    !location.pathname.startsWith("/verify-email")
  ) {
    return <Navigate to="/verify-email" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
