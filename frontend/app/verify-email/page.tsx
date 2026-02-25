'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Card, CardBody } from '../../components/ui/Card';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { toast } = useToast();
  const { user } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await authApi.resendVerification();
      if (response.emailSent === false) {
        toast('error', 'Email service is temporarily unavailable. Please try again later or contact support.');
      } else {
        setResendSent(true);
        toast('success', 'Verification email sent!');
      }
    } catch {
      toast('error', 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card>
      <CardBody className="p-8 text-center">
        {status === 'loading' && (
          <div className="space-y-4 py-4">
            <Spinner size="lg" />
            <p className="text-neutral-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-heading font-bold text-neutral-800">Email verified!</h2>
            <p className="text-neutral-600">Your email address has been verified successfully. You can now enjoy all features.</p>
            <Link href="/" className="inline-block mt-2">
              <Button size="lg">Go to homepage</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-heading font-bold text-neutral-800">Verification failed</h2>
            <p className="text-neutral-600">
              This verification link is invalid or has expired.
            </p>
            {user && !resendSent && (
              <Button
                onClick={handleResend}
                loading={resendLoading}
                variant="outline"
                className="w-full"
              >
                Resend verification email
              </Button>
            )}
            {resendSent && (
              <p className="text-sm text-green-600 font-medium">A new verification email has been sent!</p>
            )}
            <Link href="/" className="inline-block text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Back to homepage
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold text-2xl text-white mb-2">
            <span className="text-secondary-400">✦</span> African Fashion
          </Link>
        </div>
        <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
