/**
 * AboutCms — redirects to the new AboutPageCms landing page.
 *
 * The About CMS has been refactored into a modular architecture.
 * Each section now has its own dedicated CMS page reachable from
 * /admin/website/about  (AboutPageCms).
 *
 * This component is kept so any existing import in App.jsx does not break;
 * it simply forwards to the new landing page.
 */
import { Navigate } from 'react-router-dom';

export default function AboutCms() {
  return <Navigate to="/admin/website/about" replace />;
}
