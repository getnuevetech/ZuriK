'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../../lib/api';
import type { Notification } from '../../types/notification';
import { NotificationItem } from './NotificationItem';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';

type FilterTab = 'ALL' | 'UNREAD' | 'ORDER_UPDATE' | 'PAYMENT' | 'SYSTEM' | 'PAYOUT';

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
  { key: 'ORDER_UPDATE', label: 'Orders' },
  { key: 'PAYMENT', label: 'Payments' },
  { key: 'SYSTEM', label: 'System' },
  { key: 'PAYOUT', label: 'Payouts' },
];

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const load = useCallback(async (tab: FilterTab, pg: number, replace = false) => {
    setLoading(true);
    try {
      const params: { page: number; limit: number; unreadOnly?: boolean } = { page: pg, limit: 20 };
      if (tab === 'UNREAD') params.unreadOnly = true;
      const { data, total: t } = await notificationsApi.list(params);
      const filtered = tab === 'ALL' || tab === 'UNREAD'
        ? data
        : data.filter((n) => n.type === tab);
      setNotifications((prev) => replace ? filtered : [...prev, ...filtered]);
      setTotal(t);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    load(activeTab, 1, true);
  }, [activeTab, load]);

  const handleUpdate = () => {
    setPage(1);
    load(activeTab, 1, true);
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead().catch(() => undefined);
    handleUpdate();
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(activeTab, next, false);
  };

  const hasMore = notifications.length < total;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      {notifications.some((n) => !n.isRead) && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-neutral-500 font-medium">No notifications yet</p>
            <p className="text-sm text-neutral-400 mt-1">We&apos;ll notify you when something happens</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onUpdate={handleUpdate} />
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={loadMore}>Load more</Button>
        </div>
      )}
      {loading && notifications.length > 0 && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
}
