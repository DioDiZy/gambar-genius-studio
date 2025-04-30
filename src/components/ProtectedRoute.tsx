
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show nothing or a loading indicator
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If not logged in, redirect to sign in page
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If logged in, render children
  return <>{children}</>;
}
