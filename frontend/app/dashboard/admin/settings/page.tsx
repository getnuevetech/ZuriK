'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy route — redirects to canonical /admin/settings path
export default function AdminSettingsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/settings'); }, [router]);
  return null;
}
