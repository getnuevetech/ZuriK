'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '../../../../components/ui/Spinner';

export default function AdminUsersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);
  return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
}
