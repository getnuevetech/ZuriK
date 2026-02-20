'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../lib/notification-context';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import type { Notification } from '../../types/notification';

const FILTER_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Unread', value: 'UNREAD' },
  { label: 'Orders', value: 'ORDERS' },
  { label: 'Payments', value: 'PAYMENTS' },
  { label: 'System', value: 'SYSTEM' },
] as const;

type FilterValue = typeof FILTER_TABS[number]['value'];

const ORDER_TYPES = new Set(['ORDER_STATUS_CHANGE', 'NEW_ORDER', 'ORDER_ASSIGNED', 'QA_RESULT']);
const PAYMENT_TYPES = new Set(['PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PAYOUT_COMPLETED']);

function filterNotifications(notifications: Notification[], filter: FilterValue): Notification[] {
  switch (filter) {
    case 'UNREAD':
      return notifications.filter((n) => !n.isRead);
    case 'ORDERS':
      return notifications.filter((n) => ORDER_TYPES.has(n.type));
    case 'PAYMENTS':
      return notifications.filter((n) => PAYMENT_TYPES.has(n.type));
    case 'SYSTEM':
      return notifications.filter((n) => n.type === 'SYSTEM_ANNOUNCEMENT');
    default:
      return notifications;
  }
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();

  const filtered = filterNotifications(notifications, activeFilter);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-neutral-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={async () => { try { await markAllAsRead(); } catch {} }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-neutral-100 p-1 rounded-lg overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeFilter === tab.value
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading && filtered.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <div className="text-4xl mb-3">🔔</div>
            <p>Loading notifications…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <div className="text-4xl mb-3">🔔</div>
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">
              {activeFilter === 'UNREAD' ? "You're all caught up!" : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkAsRead={markAsRead}
                onClose={() => router.push('/notifications')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
