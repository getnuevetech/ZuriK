'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '../../../../lib/api';

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      authApi.exchangeGoogleCode(code)
        .then((result) => {
          localStorage.setItem('access_token', result.accessToken);
          localStorage.setItem('refresh_token', result.refreshToken);
          localStorage.setItem('auth_user', JSON.stringify(result.user));
          window.location.replace('/');
        })
        .catch(() => {
          setError('Google sign-in session expired. Please try again.');
        });
    } else {
      setError('Google sign-in failed. Please try again.');
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Sign-In Error</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Completing Google sign-in...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
