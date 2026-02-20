'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Notification } from '../../types/notification';

function notificationIcon(type: string): string {
  switch (type) {
    case 'ORDER_STATUS_CHANGE':
    case 'NEW_ORDER':
    case 'ORDER_ASSIGNED':
      return '📦';
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_FAILED':
      return '💳';
    case 'QA_RESULT':
      return '✅';
    case 'PAYOUT_COMPLETED':
      return '💰';
    default:
      return '📢';
  }
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getNavigationPath(notification: Notification): string | null {
  const orderId = notification.metadata?.orderId;
  if (orderId && ['ORDER_STATUS_CHANGE', 'NEW_ORDER', 'ORDER_ASSIGNED', 'QA_RESULT'].includes(notification.type)) {
    return `/orders/${orderId}`;
  }
  return null;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onClose?: () => void;
}

export function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (!notification.isRead) {
      await onMarkAsRead(notification.id);
    }
    const path = getNavigationPath(notification);
    if (path) {
      router.push(path);
      onClose?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={[
        'w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50',
        !notification.isRead ? 'bg-indigo-50' : '',
      ].join(' ')}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{notificationIcon(notification.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${!notification.isRead ? 'text-indigo-900' : 'text-neutral-800'}`}>
            {notification.title}
          </p>
          <span className="text-xs text-neutral-400 flex-shrink-0">{timeAgo(notification.createdAt)}</span>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{notification.message}</p>
      </div>
      {!notification.isRead && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-600 mt-2" aria-label="Unread" />
      )}
    </button>
  );
}
