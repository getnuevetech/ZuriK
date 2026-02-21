'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy route — redirects to canonical /admin/users path
export default function AdminUsersRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/users'); }, [router]);
  return null;
}
