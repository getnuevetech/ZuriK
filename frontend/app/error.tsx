'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-lg">
        {/* Decorative emoji */}
        <div className="text-7xl mb-4" aria-hidden="true">⚠️</div>

        {/* Large 500 */}
        <div
          className="text-9xl font-bold bg-gradient-to-r from-accent-500 to-red-500 bg-clip-text text-transparent mb-4 select-none"
          aria-hidden="true"
        >
          500
        </div>

        <h1 className="font-heading text-2xl font-bold text-neutral-900 mb-3">
          Something Went Wrong
        </h1>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          We&apos;re sorry — an unexpected error occurred. Our team has been notified.
          Please try again or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            ← Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg font-medium hover:bg-neutral-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
