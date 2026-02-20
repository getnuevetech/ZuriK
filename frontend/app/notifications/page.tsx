'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationList } from '../../components/notifications/NotificationList';

export default function NotificationsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
        <p className="text-neutral-500 mt-1 text-sm">Stay up to date with your orders and activity</p>
      </div>
      <NotificationList />
    </div>
  );
}
