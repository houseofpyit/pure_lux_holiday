/**
 * GuestRoute
 *
 * Wraps public auth pages (login, forgot-password, reset-password).
 * Behaviour:
 *  - While loading → render the fallback spinner
 *  - Not authenticated → render <Outlet /> (show the page)
 *  - Already authenticated → redirect to /admin
 */
import { Navigate, Outlet } from 'react-router-dom';
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
export default function GuestRoute({ fallback = <DefaultFallback /> }) {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return fallback;
  }

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
