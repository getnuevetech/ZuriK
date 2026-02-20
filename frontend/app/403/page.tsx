import React from 'react';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary-200 mb-4">403</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h1>
        <p className="text-neutral-600 mb-8">
          You don&apos;t have permission to view this page. Please contact an administrator if you
          believe this is an error.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
}
