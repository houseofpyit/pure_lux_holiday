/**
 * ProtectedRoute
 *
 * Wraps admin routes. Behaviour:
 *  - While loading (session restore in progress) → render the fallback spinner
 *  - Authenticated → render <Outlet />
 *  - Not authenticated → redirect to /login
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div
      className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"
      role="status"
      aria-label="Loading"
    />
  </div>
);

/**
 * @param {{ fallback?: React.ReactNode }} props
 */
export default function ProtectedRoute({ fallback = <DefaultFallback /> }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return fallback;
  }

  if (!authenticated) {
    // Preserve the current path so the user can be returned here after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
