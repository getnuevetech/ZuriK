'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy route — redirects to canonical /admin path
export default function AdminDashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin'); }, [router]);
  return null;
}
