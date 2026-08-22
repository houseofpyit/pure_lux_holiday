/**
 * Login page
 *
 * Flow:
 *  1. User submits email + password
 *  2. AuthContext.login() → AuthService.login() → POST /api/v1/auth/login
 *  3. On success → navigate to /admin
 *  4. On failure → inline error message + toast via handleApiError
 *
 * Handles:
 *  - Loading state (button disabled, spinner shown)
 *  - Duplicate-submit prevention (_inFlight ref)
 *  - Validation feedback (empty field guard on submit button)
 *  - 401 / 422 / network error display
 */
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prevent duplicate submissions if the user double-clicks.
  const inFlight = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;

    setInlineError('');
    inFlight.current = true;
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/admin', { replace: true });
    } catch (err) {
      // Show inline message for credential errors (401/422).
      // Show toast for network/server errors (null/500).
      if (err?.status === 401 || err?.status === 422) {
        setInlineError(err.message || 'Invalid email or password');
      } else {
        handleApiError(err, toast);
      }
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Forgot your password?{' '}
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Reset it
          </Link>
        </>
      }
    >
      {inlineError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
        >
          {inlineError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
              disabled={loading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium"
          disabled={loading || !email || !password}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Logging in...
            </>
          ) : (
            'Log in'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
