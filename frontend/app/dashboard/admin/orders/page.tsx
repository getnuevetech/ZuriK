'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '../../../../components/ui/Spinner';

export default function AdminOrdersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/orders');
  }, [router]);
  return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
}
