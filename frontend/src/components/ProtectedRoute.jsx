import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any route with <ProtectedRoute> to require authentication.
 * Pass requiredRole="ADMIN" to further restrict to admins only.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Students trying to access admin pages → redirect to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
