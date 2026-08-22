/**
 * ForgotPassword page
 *
 * Calls POST /api/v1/auth/forgot-password and always shows the success
 * message regardless of whether the email exists (prevents enumeration).
 */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import AuthService from '@/auth/authService';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const inFlight = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
    } catch (err) {
      // Still show the success state to prevent email enumeration,
      // but surface genuine network/server failures via toast.
      if (err?.status === null || err?.status >= 500) {
        handleApiError(err, toast);
      }
    } finally {
      inFlight.current = false;
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Reset password"
      subtitle="We'll send you a link to reset it"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-foreground text-center">
          If an account exists with that email, you&apos;ll receive a password reset link shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
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
          <Button
            type="submit"
            className="w-full h-12 font-medium"
            disabled={loading || !email}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
