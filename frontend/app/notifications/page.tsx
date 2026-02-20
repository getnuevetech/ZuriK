'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Notification, NotificationsResponse } from '../../types/notification';
import { notificationsApi } from '../../lib/api';
import { NotificationList } from '../../components/notifications/NotificationList';
import { Button } from '../../components/ui/Button';

type Tab = 'all' | 'unread';

export default function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async (currentPage: number, currentTab: Tab, append = false) => {
    setLoading(true);
    try {
      const params: { page: number; limit: number; unread?: boolean } = { page: currentPage, limit: 20 };
      if (currentTab === 'unread') params.unread = true;
      const result = await notificationsApi.list(params);
      setData(result);
      setNotifications((prev) => append ? [...prev, ...(result.items || [])] : (result.items || []));
    } catch {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // Check auth
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/login'); return; }
    setPage(1);
    setNotifications([]);
    fetchNotifications(1, tab, false);
  }, [tab, fetchNotifications, router]);

  const handleUpdate = useCallback(() => {
    fetchNotifications(1, tab, false);
    setPage(1);
  }, [fetchNotifications, tab]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      handleUpdate();
    } catch {}
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, tab, true);
  };

  const hasMore = data ? notifications.length < data.total : false;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-neutral-200 w-fit">
          {(['all', 'unread'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                tab === t
                  ? 'bg-primary-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <NotificationList
            notifications={notifications}
            loading={loading && page === 1}
            onUpdate={handleUpdate}
            emptyMessage={tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          />

          {hasMore && !loading && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={handleLoadMore}>
                Load more
              </Button>
            </div>
          )}

          {loading && page > 1 && (
            <div className="flex justify-center mt-4">
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
