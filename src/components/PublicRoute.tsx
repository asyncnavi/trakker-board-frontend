import { Navigate } from "react-router";
import useAuthStore from "@/store/auth";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to home if already logged in
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
