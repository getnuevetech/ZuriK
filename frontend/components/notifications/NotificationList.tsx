'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Notification } from '../../types/notification';
import { NotificationItem } from './NotificationItem';
import { notificationsApi } from '../../lib/api';

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onUpdate: () => void;
  emptyMessage?: string;
}

export function NotificationList({ notifications, loading, onUpdate, emptyMessage }: NotificationListProps) {
  const router = useRouter();

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      onUpdate();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [onUpdate]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await notificationsApi.delete(id);
      onUpdate();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [onUpdate]);

  const handleClick = useCallback((notification: Notification) => {
    const orderId = notification.data?.orderId;
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
        <span className="text-4xl mb-3">🔔</span>
        <p className="text-sm">{emptyMessage || 'No notifications yet'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}
