'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy route — redirects to canonical /admin/orders path
export default function AdminOrdersRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/orders'); }, [router]);
  return null;
}
