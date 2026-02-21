'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy route — redirects to canonical /admin/analytics path
export default function AdminAnalyticsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/analytics'); }, [router]);
  return null;
}
