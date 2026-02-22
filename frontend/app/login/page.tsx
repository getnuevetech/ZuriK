'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { extractErrorMessage } from '../../lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email, password });
      toast('success', 'Welcome back!');
      router.push('/');
    } catch (err: unknown) {
      toast('error', extractErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold text-2xl text-white mb-2">
            <span className="text-secondary-400">✦</span> African Fashion
          </Link>
          <h1 className="text-3xl font-heading font-bold text-white mt-4">Welcome back</h1>
          <p className="text-neutral-300 mt-2">Sign in to your account</p>
        </div>

        <Card>
          <CardBody className="p-8">
            <GoogleSignInButton mode="signin" />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
