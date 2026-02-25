'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { authApi } from '../../lib/api';
import { useToast } from '../ui/Toast';

export function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || !user || user.isEmailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await authApi.resendVerification();
      if (response.emailSent === false) {
        toast('error', 'Email service is temporarily unavailable. Please try again later or contact support.');
      } else {
        toast('success', 'Verification email sent! Please check your inbox.');
      }
    } catch {
      toast('error', 'Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-amber-800">
          <span className="font-medium">Please verify your email address.</span>{' '}
          Check your inbox for a verification link.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-sm font-medium text-amber-900 underline hover:text-amber-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Resend verification email'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-600 hover:text-amber-800 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
