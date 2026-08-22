/**
 * Register page — Admin accounts are created by a super-admin; public
 * self-registration is not supported. Redirect to login.
 */
import { Navigate } from 'react-router-dom';

export default function Register() {
  return <Navigate to="/login" replace />;
}
