'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Notification } from '../../types/notification';
import { notificationsApi } from '../../lib/api';

interface NotificationItemProps {
  notification: Notification;
  onUpdate: () => void;
}

const typeIcon: Record<Notification['type'], string> = {
  ORDER_UPDATE: '📦',
  PAYMENT: '💳',
  SYSTEM: '🔔',
  PAYOUT: '💰',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function NotificationItem({ notification, onUpdate }: NotificationItemProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (!notification.isRead) {
      await notificationsApi.markAsRead(notification.id).catch(() => undefined);
      onUpdate();
    }
    const link = notification.metadata?.link || (notification.metadata?.orderId ? '/orders' : '/notifications');
    router.push(link);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationsApi.delete(notification.id).catch(() => undefined);
    onUpdate();
  };

  return (
    <div
      onClick={handleClick}
      className={[
        'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors group',
        !notification.isRead ? 'bg-indigo-50/50' : '',
      ].join(' ')}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{typeIcon[notification.type]}</span>
      <div className="flex-1 min-w-0">
        <p className={['text-sm truncate', !notification.isRead ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'].join(' ')}>
          {notification.title}
        </p>
        <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{notification.message}</p>
        <p className="text-xs text-neutral-400 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.isRead && (
          <span className="w-2 h-2 bg-indigo-600 rounded-full" aria-label="Unread" />
        )}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all rounded"
          aria-label="Delete notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
