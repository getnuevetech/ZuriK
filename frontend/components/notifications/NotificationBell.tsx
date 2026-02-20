'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../lib/notification-context';
import { getNotificationLink } from '../../lib/utils';
import type { Notification, NotificationType } from '../../types/notification';

const TYPE_ICONS: Record<NotificationType, string> = {
  ORDER_STATUS: '📦',
  PAYMENT: '💳',
  PAYOUT: '💰',
  SYSTEM: 'ℹ️',
  QA_RESULT: '✅',
  NEW_ORDER: '🆕',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString();
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const router = useRouter();

  function handleClick() {
    if (!notification.isRead) onMarkRead(notification.id);
    const link = getNotificationLink(notification);
    if (link) router.push(link);
  }

  return (
    <button
      onClick={handleClick}
      className={[
        'w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-neutral-50 transition-colors',
        !notification.isRead ? 'border-l-4 border-indigo-600 bg-indigo-50/40' : 'border-l-4 border-transparent',
      ].join(' ')}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notification.type] ?? '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className={['text-sm truncate', !notification.isRead ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'].join(' ')}>
          {notification.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-neutral-400 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const { unreadCount, notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-neutral-200 hover:text-secondary-300 transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-modal border border-neutral-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-sm">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => { markAsRead(id); }}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-4 py-2.5 text-center">
            <Link
              href="/notifications"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
