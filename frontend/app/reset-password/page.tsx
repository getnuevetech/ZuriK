'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

function ResetPasswordContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!newPassword) newErrors.newPassword = 'Password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!token) {
      setApiError('Invalid reset link. Please request a new one.');
      return;
    }
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      toast('success', 'Password reset successfully!');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(message || 'Invalid or expired reset link.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card>
        <CardBody className="p-8 text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold text-neutral-800">Invalid reset link</h2>
          <p className="text-neutral-600">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="inline-block text-primary-600 hover:text-primary-700 font-medium transition-colors">
            Request a new reset link
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-8">
        {success ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-semibold text-neutral-800">Password reset!</h2>
            <p className="text-neutral-600">Your password has been updated. Redirecting you to login...</p>
            <Link href="/login" className="inline-block text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                <p>{apiError}</p>
                <Link href="/forgot-password" className="font-medium underline mt-1 inline-block">
                  Request a new reset link
                </Link>
              </div>
            )}
            <Input
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Reset password
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold text-2xl text-white mb-2">
            <span className="text-secondary-400">✦</span> African Fashion
          </Link>
          <h1 className="text-3xl font-heading font-bold text-white mt-4">Reset your password</h1>
          <p className="text-neutral-300 mt-2">Enter your new password below</p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
