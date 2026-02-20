'use client';

import React from 'react';
import { Notification, NotificationType } from '../../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  ORDER_STATUS_CHANGE: '📦',
  PAYMENT_RECEIVED: '💳',
  PAYMENT_FAILED: '❌',
  NEW_ORDER: '🛍️',
  PAYOUT_COMPLETED: '💰',
  QA_RESULT: '🔍',
  SYSTEM_ANNOUNCEMENT: '📢',
};

const TYPE_COLORS: Record<NotificationType, string> = {
  ORDER_STATUS_CHANGE: 'bg-blue-50 border-blue-200',
  PAYMENT_RECEIVED: 'bg-yellow-50 border-yellow-200',
  PAYMENT_FAILED: 'bg-red-50 border-red-200',
  NEW_ORDER: 'bg-blue-50 border-blue-200',
  PAYOUT_COMPLETED: 'bg-yellow-50 border-yellow-200',
  QA_RESULT: 'bg-green-50 border-green-200',
  SYSTEM_ANNOUNCEMENT: 'bg-neutral-50 border-neutral-200',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) {
  const icon = TYPE_ICONS[notification.type] || '🔔';
  const colorClass = TYPE_COLORS[notification.type] || 'bg-neutral-50 border-neutral-200';

  return (
    <div
      className={[
        'flex items-start gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors hover:opacity-90',
        notification.isRead ? 'bg-white border-neutral-100' : `${colorClass} border`,
      ].join(' ')}
      onClick={() => {
        if (!notification.isRead) onMarkAsRead(notification.id);
        if (onClick) onClick(notification);
      }}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={['text-sm truncate', notification.isRead ? 'font-normal text-neutral-700' : 'font-semibold text-neutral-900'].join(' ')}>
          {notification.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-neutral-400 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1.5" aria-label="Unread" />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
        className="text-neutral-300 hover:text-red-400 transition-colors flex-shrink-0 text-xs ml-1"
        aria-label="Delete notification"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
