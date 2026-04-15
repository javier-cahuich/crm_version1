import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

/**
 * Wraps protected routes. While the session is loading it renders nothing
 * (avoids a flash-redirect on refresh). Once resolved:
 * - Authenticated  → renders the child route (<Outlet />)
 * - Unauthenticated → redirects to /auth
 */
export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    // Render a blank screen while Supabase resolves the session.
    // This prevents an incorrect redirect on page refresh.
    return null;
  }

  return session ? <Outlet /> : <Navigate to="/auth" replace />;
}
