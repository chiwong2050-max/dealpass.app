import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithToken, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [magicStatus, setMagicStatus] = useState<'idle' | 'working' | 'failed'>('idle');
  const magicAttempted = useRef(false);

  // A business following the emailed magic link lands here with ?token=...
  // Redeem it once, then the auth hook redirects into the app.
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token || magicAttempted.current) return;
    magicAttempted.current = true;
    setMagicStatus('working');
    loginWithToken(token).catch(() => setMagicStatus('failed'));
  }, [searchParams, loginWithToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      // Error handled by useAuth and toast
    }
  };

  if (magicStatus === 'working') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Signing you in…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            {magicStatus === 'failed'
              ? 'That sign-in link is invalid or has expired. Log in below or request a new link.'
              : 'Enter your email and password to access your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;