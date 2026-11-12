import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Zap } from "lucide-react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userProfile, userRole, isLoading } = useAuth();
  const location = useLocation();

  // Loading state while verifying persistent session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-900/50 animate-pulse mb-4">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Verifying VoltFlow Enterprise Credentials...</p>
        <span className="text-xs text-slate-500 mt-1">Checking authentication and role permissions</span>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account disabled check
  if (userProfile && userProfile.isActive === false) {
    return <Navigate to="/login" state={{ error: "Your account is deactivated." }} replace />;
  }

  // Role restriction check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
