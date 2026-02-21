'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      toast('error', 'Something went wrong. Please try again.');
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
          <h1 className="text-3xl font-heading font-bold text-white mt-4">Forgot password?</h1>
          <p className="text-neutral-300 mt-2">We&apos;ll send you a reset link</p>
        </div>

        <Card>
          <CardBody className="p-8">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="text-5xl">📧</div>
                <h2 className="text-xl font-semibold text-neutral-800">Check your email</h2>
                <p className="text-neutral-600">
                  If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link.
                </p>
                <p className="text-sm text-neutral-500">Didn&apos;t receive it? Check your spam folder.</p>
                <Link href="/login" className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium transition-colors">
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  autoComplete="email"
                />
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Send reset link
                </Button>
                <p className="text-center text-sm text-neutral-500">
                  <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                    Back to login
                  </Link>
                </p>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
