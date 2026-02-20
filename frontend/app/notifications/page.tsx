'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notificationsApi } from '../../lib/api';
import { useNotifications } from '../../lib/notification-context';
import { getNotificationLink } from '../../lib/utils';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import type { Notification, NotificationType } from '../../types/notification';

const TYPE_ICONS: Record<NotificationType, string> = {
  ORDER_STATUS: '📦',
  PAYMENT: '💳',
  PAYOUT: '💰',
  SYSTEM: 'ℹ️',
  QA_RESULT: '✅',
  NEW_ORDER: '🆕',
};

const TYPE_LABELS: Record<NotificationType, string> = {
  ORDER_STATUS: 'Order Status',
  PAYMENT: 'Payment',
  PAYOUT: 'Payout',
  SYSTEM: 'System',
  QA_RESULT: 'QA Result',
  NEW_ORDER: 'New Order',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString();
}

const ALL_TYPES: (NotificationType | 'all')[] = ['all', 'ORDER_STATUS', 'PAYMENT', 'PAYOUT', 'SYSTEM', 'QA_RESULT', 'NEW_ORDER'];

export default function NotificationsPage() {
  const router = useRouter();
  const { markAllAsRead, refresh: refreshContext } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const limit = 20;

  const load = useCallback(async (p: number) => {
    try {
      setLoading(true);
      const res = await notificationsApi.list(p, limit);
      setNotifications(res.notifications || []);
      setTotal(res.total || 0);
    } catch {
      // not authenticated or error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    load(page);
  }, [load, page, router]);

  const handleMarkAsRead = async (n: Notification) => {
    if (!n.isRead) {
      await notificationsApi.markAsRead(n.id);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
      await refreshContext();
    }
    const link = getNotificationLink(n);
    if (link) router.push(link);
  };

  const handleDelete = async (id: string) => {
    await notificationsApi.delete(id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    await refreshContext();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterRead === 'unread' && n.isRead) return false;
    if (filterRead === 'read' && !n.isRead) return false;
    return true;
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          Mark all as read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1">
          {(['all', 'unread', 'read'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterRead(v)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                filterRead === v
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              ].join(' ')}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                filterType === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              ].join(' ')}
            >
              {t === 'all' ? 'All Types' : TYPE_LABELS[t as NotificationType]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-neutral-500">No notifications found.</div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={[
                'flex gap-3 items-start p-4 rounded-xl border transition-colors cursor-pointer',
                !n.isRead
                  ? 'border-indigo-200 bg-indigo-50/50 border-l-4 border-l-indigo-600'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50',
              ].join(' ')}
              onClick={() => handleMarkAsRead(n)}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={['text-sm', !n.isRead ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'].join(' ')}>
                  {n.title}
                </p>
                <p className="text-sm text-neutral-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-neutral-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                className="flex-shrink-0 p-1 text-neutral-400 hover:text-red-500 transition-colors"
                aria-label="Delete notification"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-neutral-600">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
